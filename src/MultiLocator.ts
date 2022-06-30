import { readFile } from "fs/promises";
import {
  ByHash,
  error,
  ThenableWebDriver,
  WebElement,
  WebElementPromise,
} from "selenium-webdriver";
import { Browser, Element } from "webdriverio";
import { CodeFixer, getLocatorValue } from "./CodeFixer";
import { readLocatorOrderFile } from "./FixHistory";
import {
  InvocationInfo,
  parse,
  ParsedCodeFragments,
} from "./MethodInvocationParser";
import {
  GetElementByDriver,
  GetElementPromiseByDriver,
  TargetDriver,
  TargetLocator,
  TargetLocatorTypes,
} from "./Types";

export const findElementMultiSelenium = (
  driver: ThenableWebDriver,
  invocationInfo: InvocationInfo,
  codeFixer: CodeFixer,
  ...locators: unknown[]
): WebElementPromise => {
  const seleniumStrategy: FindElementStrategy<ThenableWebDriver> = {
    getFindElementResults: (locators, driver) =>
      locators.map((locator) =>
        driver.findElement(toSeleniumCompatible(locator))
      ),
    isLocatorCorrect: (
      result: PromiseSettledResult<WebElement>
    ): result is PromiseFulfilledResult<WebElement> =>
      result.status === "fulfilled",
    isLocatorBroken: (result: PromiseSettledResult<WebElement>): boolean =>
      result.status === "rejected" &&
      ["InvalidSelectorError", "NoSuchElementError"].includes(
        result.reason.name
      ),
  };

  return new WebElementPromise(
    driver,
    findElementAndRegisterFix(
      driver,
      invocationInfo,
      codeFixer,
      locators,
      seleniumStrategy
    )
  );
};

export const findElementMultiWdio = async (
  driver: Browser<"async">,
  invocationInfo: InvocationInfo,
  codeFixer: CodeFixer,
  ...locators: unknown[]
): Promise<Element<"async">> => {
  const wdioStrategy: FindElementStrategy<Browser<"async">> = {
    getFindElementResults: (locators, driver) =>
      locators.map((locator) => driver.$(toWdioCompatible(locator))),
    isLocatorCorrect: (
      result: PromiseSettledResult<Element<"async">>
    ): result is PromiseFulfilledResult<Element<"async">> =>
      // fulfilled status doesn't always mean element was successfully specified.
      result.status === "fulfilled" && result.value.error === undefined,
    isLocatorBroken: (result: PromiseSettledResult<any>): boolean =>
      (result.status === "fulfilled" &&
        result.value.error?.error === "no such element") ||
      (result.status === "rejected" &&
        result.reason.name === "invalid selector"),
  };

  return findElementAndRegisterFix(
    driver,
    invocationInfo,
    codeFixer,
    locators,
    wdioStrategy
  );
};

type FindElementStrategy<T extends TargetDriver> = {
  getFindElementResults: (
    locator: TargetLocator[],
    driver: T
  ) => GetElementPromiseByDriver<T>[];
  isLocatorCorrect: (
    result: PromiseSettledResult<GetElementByDriver<T>>
  ) => result is PromiseFulfilledResult<GetElementByDriver<T>>;
  isLocatorBroken: (
    result: PromiseSettledResult<GetElementByDriver<T>>
  ) => boolean;
};

const findElementAndRegisterFix = async <T extends TargetDriver>(
  driver: T,
  invocationInfo: InvocationInfo,
  codeFixer: CodeFixer,
  maybeLocators: unknown[],
  strategy: FindElementStrategy<T>
): Promise<GetElementByDriver<T>> => {
  const locatorOrder = await readLocatorOrderFile();
  const locators = maybeLocators.map(validateLocator).sort((l1, l2) => {
    const order1 = locatorOrder.get(l1.type);
    const order2 = locatorOrder.get(l2.type);
    if (order2 === undefined) {
      return -1;
    } else {
      if (order1 === undefined) {
        return 1;
      } else {
        return order1 - order2;
      }
    }
  });
  const promises = strategy.getFindElementResults(locators, driver);
  const findElementResults = await Promise.allSettled(promises);

  const correctElement = findElementResults.find(
    strategy.isLocatorCorrect
  )?.value;
  if (correctElement === undefined) {
    throw new error.NoSuchElementError(
      `Unable to locate element by any locators:` + JSON.stringify(locators)
    );
  }
  const brokenLocators = findElementResults.reduce(
    (brokenLocators: TargetLocator[], result, i) => {
      if (strategy.isLocatorBroken(result)) {
        brokenLocators.push(locators[i]);
      }
      return brokenLocators;
    },
    []
  );

  if (brokenLocators.length !== 0) {
    const { locatorCodeFragments } = await getCodeFragments(invocationInfo);
    await codeFixer.registerFix(
      driver,
      correctElement,
      brokenLocators,
      locatorCodeFragments
    );
  }

  return correctElement;
};

const toWdioCompatible = (locator: TargetLocator): string => {
  switch (locator.type) {
    case "id":
      return `//*[@id="${locator.value}"]`;
    case "name":
      return `//*[@name="${locator.value}"]`;
    case "linkText":
      return `=${locator.value}`;
    case "partialLinkText":
      return `*=${locator.value}`;
    case "innerText":
      return `//*[text()='${locator.value}']`;
    case "partialInnerText":
      return `//*[contains(text(), '${locator.value}')]`;
    case "xpath":
    case "css":
      return locator.value;
    default:
      const unreachable: never = locator.type;
      return unreachable;
  }
};

const toSeleniumCompatible = (locator: TargetLocator): ByHash => {
  switch (locator.type) {
    case "id":
    case "name":
    case "linkText":
    case "partialLinkText":
    case "xpath":
    case "css":
      return { [locator.type]: locator.value } as ByHash;
    case "innerText":
      return { xpath: `//*[text()='${locator.value}']` };
    case "partialInnerText":
      return { xpath: `//*[contains(text(), '${locator.value}')]` };
    default:
      const unreachable: never = locator.type;
      return unreachable;
  }
};

const getCodeFragments = async (
  invocationInfo: InvocationInfo
): Promise<ParsedCodeFragments> => {
  const { file, lineNum } = invocationInfo;
  const data = await readFile(file, "utf-8");
  const lines = data.split("\n");
  const invocationCode = lines.slice(lineNum - 1).join("\n");
  return parse(invocationCode, invocationInfo);
};

const isLocator = (
  maybeLocator: unknown
): maybeLocator is Record<TargetLocator["type"], string> => {
  if (maybeLocator === null || typeof maybeLocator !== "object") {
    return false;
  }
  const entries = Object.entries(maybeLocator);
  if (entries.length !== 1) {
    return false;
  }
  const type = entries[0][0];
  const value = entries[0][1];
  if (
    (TargetLocatorTypes as ReadonlyArray<string>).includes(type) &&
    typeof value === "string"
  ) {
    return true;
  }
  return false;
};

const validateLocator = (maybeLocator: unknown): TargetLocator => {
  if (!isLocator(maybeLocator)) {
    throw new Error('locator format error: locators should be {type: "value"}');
  }
  const locator = Object.entries(maybeLocator);
  const type = locator[0][0] as TargetLocator["type"];
  const value = locator[0][1];
  return { type, value };
};

export const extendLocator = async (
  driver: ThenableWebDriver,
  invocationInfo: InvocationInfo,
  codeFixer: CodeFixer,
  maybeLocator: unknown
  // strategy: FindElementStrategy<ThenableWebDriver>
) => {
  const locator = validateLocator(maybeLocator);
  const element: WebElement = await driver.findElement(
    toSeleniumCompatible(locator)
  );
  const extendedLocators: TargetLocator[] = [];
  TargetLocatorTypes.forEach(async (type) => {
    const value = await getLocatorValue(driver, element, type);
    if (value !== null) {
      extendedLocators.push({ type, value });
    }
  });
};
