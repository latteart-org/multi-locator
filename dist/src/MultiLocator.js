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
exports.findElementAndRegisterLocatorExtension = exports.findElementAndRegisterLocatorFix = void 0;
var promises_1 = require("fs/promises");
var selenium_webdriver_1 = require("selenium-webdriver");
var FilePathSetting_1 = require("./FilePathSetting");
var LocatorOrder_1 = require("./LocatorOrder");
var MethodInvocationParser_1 = require("./MethodInvocationParser");
var Types_1 = require("./Types");
var findElementAndRegisterLocatorFix = function (invocationInfo, codeFixRegister, maybeLocators, findElement, locatorCheck, isApplyLocatorOrder) { return __awaiter(void 0, void 0, void 0, function () {
    var locatorOrder, validatedLocators, locators, promises, findElementResults, correctElement, fixFilter, brokenLocators, locatorCodeFragments;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, LocatorOrder_1.readLocatorOrder)(FilePathSetting_1.locatorOrderFile)];
            case 1:
                locatorOrder = _b.sent();
                validatedLocators = maybeLocators.map(validateLocator);
                locators = isApplyLocatorOrder
                    ? validatedLocators.sort(compareLocator(locatorOrder))
                    : validatedLocators;
                promises = locators.map(function (locator) { return findElement(locator); });
                return [4 /*yield*/, Promise.allSettled(promises)];
            case 2:
                findElementResults = _b.sent();
                correctElement = (_a = findElementResults.find(locatorCheck.isFound)) === null || _a === void 0 ? void 0 : _a.value;
                if (correctElement === undefined) {
                    throw new selenium_webdriver_1.error.NoSuchElementError("Unable to locate element by any locators:" + JSON.stringify(locators));
                }
                return [4 /*yield*/, Promise.all(locators.map(function (locator, i) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = locatorCheck.isNotFound(findElementResults[i]);
                                    if (_a) return [3 /*break*/, 2];
                                    _b = isDifferent;
                                    return [4 /*yield*/, findElement(locator)];
                                case 1:
                                    _a = _b.apply(void 0, [_c.sent(), correctElement]);
                                    _c.label = 2;
                                case 2: return [2 /*return*/, _a];
                            }
                        });
                    }); }))];
            case 3:
                fixFilter = _b.sent();
                brokenLocators = locators.filter(function (_, i) { return fixFilter[i]; });
                if (!(brokenLocators.length !== 0)) return [3 /*break*/, 6];
                return [4 /*yield*/, getCodeFragments(invocationInfo)];
            case 4:
                locatorCodeFragments = (_b.sent()).locatorCodeFragments;
                return [4 /*yield*/, codeFixRegister.registerLocatorFix(correctElement, brokenLocators, locatorCodeFragments)];
            case 5:
                _b.sent();
                _b.label = 6;
            case 6: return [2 /*return*/, correctElement];
        }
    });
}); };
exports.findElementAndRegisterLocatorFix = findElementAndRegisterLocatorFix;
var findElementAndRegisterLocatorExtension = function (invocationInfo, codeFixRegister, findElement, maybeLocator) { return __awaiter(void 0, void 0, void 0, function () {
    var locator, correctElement, _a, argumentsCodeFragment, methodInvocationCodeFragment;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                locator = validateLocator(maybeLocator);
                return [4 /*yield*/, findElement(locator)];
            case 1:
                correctElement = _b.sent();
                return [4 /*yield*/, getCodeFragments(invocationInfo)];
            case 2:
                _a = _b.sent(), argumentsCodeFragment = _a.argumentsCodeFragment, methodInvocationCodeFragment = _a.methodInvocationCodeFragment;
                return [4 /*yield*/, codeFixRegister.registerLocatorExtension(correctElement, argumentsCodeFragment, methodInvocationCodeFragment)];
            case 3:
                _b.sent();
                return [2 /*return*/, correctElement];
        }
    });
}); };
exports.findElementAndRegisterLocatorExtension = findElementAndRegisterLocatorExtension;
/**
 * A lazy way to determine equivalence between elements
 * @param maybeBroken
 * @param correctElement
 * @returns is different or not
 */
var isDifferent = function (maybeBroken, correctElement) { return __awaiter(void 0, void 0, void 0, function () {
    var a, b;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, maybeBroken.getAttribute("outerHTML")];
            case 1:
                a = _a.sent();
                return [4 /*yield*/, correctElement.getAttribute("outerHTML")];
            case 2:
                b = _a.sent();
                return [2 /*return*/, a !== b];
        }
    });
}); };
var compareLocator = function (locatorOrder) {
    return function (a, b) {
        var orderA = locatorOrder.get(a.type);
        var orderB = locatorOrder.get(b.type);
        if (orderB === undefined) {
            return -1;
        }
        else {
            if (orderA === undefined) {
                return 1;
            }
            else {
                return orderA - orderB;
            }
        }
    };
};
var getCodeFragments = function (invocationInfo) { return __awaiter(void 0, void 0, void 0, function () {
    var file, lineNum, data, lines, invocationCode;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                file = invocationInfo.file, lineNum = invocationInfo.lineNum;
                return [4 /*yield*/, (0, promises_1.readFile)(file, "utf-8")];
            case 1:
                data = _a.sent();
                lines = data.split("\n");
                invocationCode = lines.slice(lineNum - 1).join("\n");
                return [2 /*return*/, (0, MethodInvocationParser_1.parse)(invocationCode, invocationInfo)];
        }
    });
}); };
var isLocator = function (maybeLocator) {
    if (maybeLocator === null || typeof maybeLocator !== "object") {
        return false;
    }
    var entries = Object.entries(maybeLocator);
    if (entries.length !== 1) {
        return false;
    }
    var type = entries[0][0];
    var value = entries[0][1];
    if (Types_1.TargetLocatorTypes.includes(type) &&
        typeof value === "string") {
        return true;
    }
    return false;
};
var validateLocator = function (maybeLocator) {
    if (!isLocator(maybeLocator)) {
        throw new Error('locator format error: locators should be {type: "value"}');
    }
    var locator = Object.entries(maybeLocator)[0];
    var type = locator[0];
    var value = locator[1];
    return { type: type, value: value };
};
//# sourceMappingURL=MultiLocator.js.map