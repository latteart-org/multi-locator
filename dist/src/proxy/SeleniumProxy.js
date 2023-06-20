"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seleniumProxy = void 0;
var selenium_webdriver_1 = require("selenium-webdriver");
var DriverProxy_1 = require("../DriverProxy");
var MultiLocator_1 = require("../MultiLocator");
var seleniumProxy = function (driver) {
    return (0, DriverProxy_1.createProxy)(driver, { findElement: findElement, findElementMulti: findElementMulti });
};
exports.seleniumProxy = seleniumProxy;
var createFindElement = function (driver) { return function (locator) {
    return driver.findElement(toSeleniumCompatible(locator));
}; };
var locatorCheck = {
    isFound: function (result) {
        return result.status === "fulfilled";
    },
    isNotFound: function (result) {
        return result.status === "rejected" &&
            ["InvalidSelectorError", "NoSuchElementError"].includes(result.reason.name);
    },
};
var findElementMulti = function (driver, invocationInfo, codeFixRegister, isApplyLocatorOrder) {
    var locators = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        locators[_i - 4] = arguments[_i];
    }
    return new selenium_webdriver_1.WebElementPromise(driver, (0, MultiLocator_1.findElementAndRegisterLocatorFix)(invocationInfo, codeFixRegister, locators, createFindElement(driver), locatorCheck, isApplyLocatorOrder));
};
var findElement = function (driver, invocationInfo, codeFixRegister, maybeLocator) {
    return new selenium_webdriver_1.WebElementPromise(driver, (0, MultiLocator_1.findElementAndRegisterLocatorExtension)(invocationInfo, codeFixRegister, createFindElement(driver), maybeLocator));
};
var toSeleniumCompatible = function (locator) {
    var _a;
    switch (locator.type) {
        case "id":
        case "name":
        case "linkText":
        case "partialLinkText":
        case "xpath":
        case "css":
            return _a = {}, _a[locator.type] = locator.value, _a;
        case "innerText":
            return { xpath: "//*[text()='".concat(locator.value, "']") };
        case "partialInnerText":
            return { xpath: "//*[contains(text(), '".concat(locator.value, "')]") };
        default:
            var unreachable = locator.type;
            return unreachable;
    }
};
//# sourceMappingURL=SeleniumProxy.js.map