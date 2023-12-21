import { readFile } from "fs/promises";
import { error } from "selenium-webdriver";
import { CodeFixRegister } from "./CodeFixer";
import { locatorOrderFile } from "./FilePathSetting";
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
  isFound: (
    result: PromiseSettledResult<GetAwaitedElementByDriver<T>>
  ) => result is PromiseFulfilledResult<GetAwaitedElementByDriver<T>>;

  isNotFound: (
    result: PromiseSettledResult<GetAwaitedElementByDriver<T>>
  ) => boolean;
};

export const findElementAndRegisterLocatorFix = async <T extends TargetDriver>(
  invocationInfo: InvocationInfo,
  codeFixRegister: CodeFixRegister<T>,
  maybeLocators: unknown[],
  findElement: FindElement<T>,
  locatorCheck: LocatorCheck<T>,
  isApplyLocatorOrder: boolean
): Promise<GetAwaitedElementByDriver<T>> => {
  const locatorOrder = await readLocatorOrder(locatorOrderFile);
  const validatedLocators = maybeLocators.map(validateLocator);
  const locators = isApplyLocatorOrder
    ? validatedLocators.sort(compareLocator(locatorOrder))
    : validatedLocators;
  const promises = locators.map((locator) => findElement(locator));
  const findElementResults = await Promise.allSettled(promises);

  const correctElement = findElementResults.find(locatorCheck.isFound)?.value;
  if (correctElement === undefined) {
    throw new error.NoSuchElementError(
      `Unable to locate element by any locators:` + JSON.stringify(locators)
    );
  }

  const fixFilter: boolean[] = await Promise.all(
    locators.map(
      async (locator, i) =>
        locatorCheck.isNotFound(findElementResults[i]) ||
        isDifferent(await findElement(locator), correctElement)
    )
  );
  const brokenLocators = locators.filter((_, i) => fixFilter[i]);

  if (brokenLocators.length !== 0) {
    const { locatorCodeFragments } = await getCodeFragments(invocationInfo);
    await codeFixRegister.registerLocatorFix(
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
  codeFixRegister: CodeFixRegister<T>,
  findElement: FindElement<T>,
  maybeLocator: unknown
): Promise<GetRawElementByDriver<T>> => {
  const locator = validateLocator(maybeLocator);
  const correctElement = await findElement(locator);
  const { argumentsCodeFragment, methodInvocationCodeFragment } =
    await getCodeFragments(invocationInfo);
  await codeFixRegister.registerLocatorExtension(
    locator,
    correctElement,
    argumentsCodeFragment,
    methodInvocationCodeFragment,
  );
  return correctElement;
};

/**
 * A lazy way to determine equivalence between elements
 * @param maybeBroken
 * @param correctElement
 * @returns is different or not
 */
const isDifferent = async <T extends TargetDriver>(
  maybeBroken: GetRawElementByDriver<T>,
  correctElement: Awaited<GetRawElementByDriver<T>>
): Promise<boolean> => {
  const a = await maybeBroken.getAttribute("outerHTML");
  const b = await correctElement.getAttribute("outerHTML");
  return a !== b;
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
  const locator = Object.entries(maybeLocator)[0];
  const type = locator[0] as TargetLocator["type"];
  const value = locator[1];
  return { type, value };
};
