"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wdioProxy = void 0;
const DriverProxy_1 = require("../DriverProxy");
const MultiLocator_1 = require("../MultiLocator");
const wdioProxy = (driver) => (0, DriverProxy_1.createProxy)(driver, { findElement, findElementMulti });
exports.wdioProxy = wdioProxy;
const createFindElement = (driver) => (locator) => driver.$(toWdioCompatible(locator));
const locatorCheck = {
    isFound: (result) => 
    // fulfilled status doesn't always mean element was successfully specified.
    result.status === "fulfilled" && result.value.error === undefined,
    isNotFound: (result) => (result.status === "fulfilled" &&
        result.value.error?.error === "no such element") ||
        (result.status === "rejected" && result.reason.name === "invalid selector"),
};
const findElementMulti = async (driver, invocationInfo, codeFixRegister, isApplyLocatorOrder, ...locators) => {
    return (0, MultiLocator_1.findElementAndRegisterLocatorFix)(invocationInfo, codeFixRegister, locators, createFindElement(driver), locatorCheck, isApplyLocatorOrder);
};
const findElement = (driver, invocationInfo, codeFixRegister, maybeLocator) => (0, MultiLocator_1.findElementAndRegisterLocatorExtension)(invocationInfo, codeFixRegister, createFindElement(driver), maybeLocator);
const toWdioCompatible = (locator) => {
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
            const unreachable = locator.type;
            return unreachable;
    }
};
//# sourceMappingURL=WdioProxy.js.map