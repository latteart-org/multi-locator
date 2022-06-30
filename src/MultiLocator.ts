import { readFile } from "fs/promises";
import {
  error,
  ThenableWebDriver,
  WebElement,
  WebElementPromise,
} from "selenium-webdriver";
import { Browser, Element } from "webdriverio";
import { CodeFixer } from "./CodeFixer";
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
import {
  findElementCommon,
  toSeleniumCompatible,
  toWdioCompatible,
} from "./WebDriverUtil";

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
    findElementAndRegisterLocatorFix(
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

  return findElementAndRegisterLocatorFix(
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

const compareLocator =
  (locatorOrder: Map<string, number>) =>
  (a: TargetLocator, b: TargetLocator) => {
    const orderA = locatorOrder.get(a.type);
    const orderB = locatorOrder.get(b.type);
    if (orderB === undefined) {
      return -1;
    } else {
      if (orderA === undefined) {
        return 1;
      } else {
        return orderA - orderB;
      }
    }
  };

const findElementAndRegisterLocatorFix = async <T extends TargetDriver>(
  driver: T,
  invocationInfo: InvocationInfo,
  codeFixer: CodeFixer,
  maybeLocators: unknown[],
  strategy: FindElementStrategy<T>
): Promise<GetElementByDriver<T>> => {
  const locatorOrder = await readLocatorOrderFile();
  const locators = maybeLocators
    .map(validateLocator)
    .sort(compareLocator(locatorOrder));
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
    await codeFixer.registerLocatorFix(
      driver,
      correctElement,
      brokenLocators,
      locatorCodeFragments
    );
  }

  return correctElement;
};

export const findElementSelenium = (
  driver: ThenableWebDriver,
  invocationInfo: InvocationInfo,
  codeFixer: CodeFixer,
  maybeLocator: unknown
): WebElementPromise => {
  return new WebElementPromise(
    driver,
    findElementAndRegisterLocatorExtension(
      driver,
      invocationInfo,
      codeFixer,
      maybeLocator
    )
  );
};

const findElementAndRegisterLocatorExtension = async <T extends TargetDriver>(
  driver: T,
  invocationInfo: InvocationInfo,
  codeFixer: CodeFixer,
  maybeLocator: unknown
): Promise<GetElementByDriver<T>> => {
  const locator = validateLocator(maybeLocator);
  const correctElement = await findElementCommon(driver, locator);
  const { argumentsCodeFragment, methodInvocationCodeFragment } =
    await getCodeFragments(invocationInfo);
  await codeFixer.registerLocatorExtension(
    driver,
    correctElement,
    argumentsCodeFragment,
    methodInvocationCodeFragment
  );
  return correctElement;
};

export const findElementWdio = findElementAndRegisterLocatorExtension;

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
