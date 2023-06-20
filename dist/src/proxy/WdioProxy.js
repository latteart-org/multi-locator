"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wdioProxy = void 0;
var DriverProxy_1 = require("../DriverProxy");
var MultiLocator_1 = require("../MultiLocator");
var wdioProxy = function (driver) {
    return (0, DriverProxy_1.createProxy)(driver, { findElement: findElement, findElementMulti: findElementMulti });
};
exports.wdioProxy = wdioProxy;
var createFindElement = function (driver) { return function (locator) {
    return driver.$(toWdioCompatible(locator));
}; };
var locatorCheck = {
    isFound: function (result) {
        // fulfilled status doesn't always mean element was successfully specified.
        return result.status === "fulfilled" && result.value.error === undefined;
    },
    isNotFound: function (result) {
        var _a;
        return (result.status === "fulfilled" &&
            ((_a = result.value.error) === null || _a === void 0 ? void 0 : _a.error) === "no such element") ||
            (result.status === "rejected" && result.reason.name === "invalid selector");
    },
};
var findElementMulti = function (driver, invocationInfo, codeFixRegister, isApplyLocatorOrder) {
    var locators = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        locators[_i - 4] = arguments[_i];
    }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, MultiLocator_1.findElementAndRegisterLocatorFix)(invocationInfo, codeFixRegister, locators, createFindElement(driver), locatorCheck, isApplyLocatorOrder)];
        });
    });
};
var findElement = function (driver, invocationInfo, codeFixRegister, maybeLocator) {
    return (0, MultiLocator_1.findElementAndRegisterLocatorExtension)(invocationInfo, codeFixRegister, createFindElement(driver), maybeLocator);
};
var toWdioCompatible = function (locator) {
    switch (locator.type) {
        case "id":
            return "//*[@id=\"".concat(locator.value, "\"]");
        case "name":
            return "//*[@name=\"".concat(locator.value, "\"]");
        case "linkText":
            return "=".concat(locator.value);
        case "partialLinkText":
            return "*=".concat(locator.value);
        case "innerText":
            return "//*[text()='".concat(locator.value, "']");
        case "partialInnerText":
            return "//*[contains(text(), '".concat(locator.value, "')]");
        case "xpath":
        case "css":
            return locator.value;
        default:
            var unreachable = locator.type;
            return unreachable;
    }
};
//# sourceMappingURL=WdioProxy.js.map