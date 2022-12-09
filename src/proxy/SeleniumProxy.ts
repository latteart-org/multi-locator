import { ByHash, WebElementPromise } from "selenium-webdriver";
import { CodeFixRegister } from "../CodeFixer";
import { createProxy } from "../DriverProxy";
import { InvocationInfo } from "../MethodInvocationParser";
import {
  findElementAndRegisterLocatorExtension,
  findElementAndRegisterLocatorFix,
  LocatorCheck,
} from "../MultiLocator";
import {
  FindElement,
  SeleniumDriver,
  SeleniumElement,
  TargetLocator,
} from "../Types";

export const seleniumProxy = (driver: SeleniumDriver): SeleniumDriver =>
  createProxy(driver, { findElement, findElementMulti });

const createFindElement: (
  driver: SeleniumDriver
) => FindElement<SeleniumDriver> = (driver) => (locator) =>
  driver.findElement(toSeleniumCompatible(locator));

const locatorCheck: LocatorCheck<SeleniumDriver> = {
  isFound: (
    result: PromiseSettledResult<SeleniumElement>
  ): result is PromiseFulfilledResult<SeleniumElement> =>
    result.status === "fulfilled",

  isNotFound: (result: PromiseSettledResult<SeleniumElement>): boolean =>
    result.status === "rejected" &&
    ["InvalidSelectorError", "NoSuchElementError"].includes(result.reason.name),
};

const findElementMulti = (
  driver: SeleniumDriver,
  invocationInfo: InvocationInfo,
  codeFixRegister: CodeFixRegister<SeleniumDriver>,
  isApplyLocatorOrder: boolean,
  ...locators: unknown[]
): WebElementPromise => {
  return new WebElementPromise(
    driver,
    findElementAndRegisterLocatorFix(
      invocationInfo,
      codeFixRegister,
      locators,
      createFindElement(driver),
      locatorCheck,
      isApplyLocatorOrder
    )
  );
};

const findElement = (
  driver: SeleniumDriver,
  invocationInfo: InvocationInfo,
  codeFixRegister: CodeFixRegister<SeleniumDriver>,
  maybeLocator: unknown
): WebElementPromise => {
  return new WebElementPromise(
    driver,
    findElementAndRegisterLocatorExtension(
      invocationInfo,
      codeFixRegister,
      createFindElement(driver),
      maybeLocator
    )
  );
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
