import { CodeFixer } from "../CodeFixer";
import { createProxy } from "../DriverProxy";
import { InvocationInfo } from "../MethodInvocationParser";
import {
  findElementAndRegisterLocatorExtension,
  findElementAndRegisterLocatorFix,
  LocatorCheck,
} from "../MultiLocator";
import { FindElement, TargetLocator, WdioDriver, WdioElement } from "../Types";

export const wdioProxy = (driver: WdioDriver): WdioDriver =>
  createProxy(driver, { findElement, findElementMulti });

const createFindElement: (driver: WdioDriver) => FindElement<WdioDriver> =
  (driver) => (locator) =>
    driver.$(toWdioCompatible(locator));

const locatorCheck: LocatorCheck<WdioDriver> = {
  isFound: (
    result: PromiseSettledResult<WdioElement>
  ): result is PromiseFulfilledResult<WdioElement> =>
    // fulfilled status doesn't always mean element was successfully specified.
    result.status === "fulfilled" && result.value.error === undefined,

  isNotFound: (result: PromiseSettledResult<any>): boolean =>
    (result.status === "fulfilled" &&
      result.value.error?.error === "no such element") ||
    (result.status === "rejected" && result.reason.name === "invalid selector"),
};

const findElementMulti = async (
  driver: WdioDriver,
  invocationInfo: InvocationInfo,
  codeFixer: CodeFixer<WdioDriver>,
  isApplyLocatorOrder: boolean,
  ...locators: unknown[]
): Promise<WdioElement> => {
  return findElementAndRegisterLocatorFix(
    invocationInfo,
    codeFixer,
    locators,
    createFindElement(driver),
    locatorCheck,
    isApplyLocatorOrder
  );
};

const findElement = (
  driver: WdioDriver,
  invocationInfo: InvocationInfo,
  codeFixer: CodeFixer<WdioDriver>,
  maybeLocator: unknown
) =>
  findElementAndRegisterLocatorExtension(
    invocationInfo,
    codeFixer,
    createFindElement(driver),
    maybeLocator
  );

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
