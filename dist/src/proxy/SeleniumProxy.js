"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSeleniumCompatible = exports.seleniumProxy = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const DriverProxy_1 = require("../DriverProxy");
const MultiLocator_1 = require("../MultiLocator");
const seleniumProxy = (driver) => (0, DriverProxy_1.createProxy)(driver, { findElement, findElementMulti });
exports.seleniumProxy = seleniumProxy;
const createFindElement = (driver) => (locator) => driver.findElement((0, exports.toSeleniumCompatible)(locator));
const locatorCheck = {
    isFound: (result) => result.status === "fulfilled",
    isNotFound: (result) => result.status === "rejected" &&
        ["InvalidSelectorError", "NoSuchElementError"].includes(result.reason.name),
};
const findElementMulti = (driver, invocationInfo, codeFixRegister, isApplyLocatorOrder, ...locators) => {
    return new selenium_webdriver_1.WebElementPromise(driver, (0, MultiLocator_1.findElementAndRegisterLocatorFix)(invocationInfo, codeFixRegister, locators, createFindElement(driver), locatorCheck, isApplyLocatorOrder));
};
const findElement = (driver, invocationInfo, codeFixRegister, maybeLocator) => {
    return new selenium_webdriver_1.WebElementPromise(driver, (0, MultiLocator_1.findElementAndRegisterLocatorExtension)(invocationInfo, codeFixRegister, createFindElement(driver), maybeLocator));
};
const toSeleniumCompatible = (locator) => {
    switch (locator.type) {
        case "id":
        case "name":
        case "linkText":
        case "partialLinkText":
        case "xpath":
        case "css":
            return { [locator.type]: locator.value };
        case "innerText":
            return { xpath: `//*[text()='${locator.value}']` };
        case "partialInnerText":
            return { xpath: `//*[contains(text(), '${locator.value}')]` };
        default:
            const unreachable = locator.type;
            return unreachable;
    }
};
exports.toSeleniumCompatible = toSeleniumCompatible;
//# sourceMappingURL=SeleniumProxy.js.map