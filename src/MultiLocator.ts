import { readFile } from "fs/promises";
import { error } from "selenium-webdriver";
import { CodeFixer } from "./CodeFixer";
import { readLocatorOrder } from "./LocatorOrder";
import {
  InvocationInfo,
  parse,
  ParsedCodeFragments,
} from "./MethodInvocationParser";
import {
  FindElement,
  GetAwaitedElementByDriver,
  GetRawElementByDriver,
  TargetDriver,
  TargetLocator,
  TargetLocatorTypes,
} from "./Types";

export type LocatorCheck<T extends TargetDriver> = {
  isCorrect: (
    result: PromiseSettledResult<GetAwaitedElementByDriver<T>>
  ) => result is PromiseFulfilledResult<GetAwaitedElementByDriver<T>>;

  isBroken: (
    result: PromiseSettledResult<GetAwaitedElementByDriver<T>>
  ) => boolean;
};

export const findElementAndRegisterLocatorFix = async <T extends TargetDriver>(
  invocationInfo: InvocationInfo,
  codeFixer: CodeFixer<T>,
  maybeLocators: unknown[],
  findElement: FindElement<T>,
  locatorCheck: LocatorCheck<T>
): Promise<GetAwaitedElementByDriver<T>> => {
  const locatorOrder = await readLocatorOrder();
  const locators = maybeLocators
    .map(validateLocator)
    .sort(compareLocator(locatorOrder));
  const promises = locators.map((locator) => findElement(locator));
  const findElementResults = await Promise.allSettled(promises);

  const correctElement = findElementResults.find(locatorCheck.isCorrect)?.value;
  if (correctElement === undefined) {
    throw new error.NoSuchElementError(
      `Unable to locate element by any locators:` + JSON.stringify(locators)
    );
  }

  const brokenLocators = findElementResults.reduce(
    (brokenLocators: TargetLocator[], result, i) => {
      if (locatorCheck.isBroken(result)) {
        brokenLocators.push(locators[i]);
      }
      return brokenLocators;
    },
    []
  );

  if (brokenLocators.length !== 0) {
    const { locatorCodeFragments } = await getCodeFragments(invocationInfo);
    await codeFixer.registerLocatorFix(
      correctElement,
      brokenLocators,
      locatorCodeFragments
    );
  }

  return correctElement;
};

export const findElementAndRegisterLocatorExtension = async <
  T extends TargetDriver
>(
  invocationInfo: InvocationInfo,
  codeFixer: CodeFixer<T>,
  findElement: FindElement<T>,
  maybeLocator: unknown
): Promise<GetRawElementByDriver<T>> => {
  const locator = validateLocator(maybeLocator);
  const correctElement = await findElement(locator);
  const { argumentsCodeFragment, methodInvocationCodeFragment } =
    await getCodeFragments(invocationInfo);
  await codeFixer.registerLocatorExtension(
    correctElement,
    argumentsCodeFragment,
    methodInvocationCodeFragment
  );
  return correctElement;
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
