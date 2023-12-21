"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findElementAndRegisterLocatorExtension = exports.findElementAndRegisterLocatorFix = void 0;
const promises_1 = require("fs/promises");
const selenium_webdriver_1 = require("selenium-webdriver");
const FilePathSetting_1 = require("./FilePathSetting");
const LocatorOrder_1 = require("./LocatorOrder");
const MethodInvocationParser_1 = require("./MethodInvocationParser");
const Types_1 = require("./Types");
const findElementAndRegisterLocatorFix = async (invocationInfo, codeFixRegister, maybeLocators, findElement, locatorCheck, isApplyLocatorOrder) => {
    const locatorOrder = await (0, LocatorOrder_1.readLocatorOrder)(FilePathSetting_1.locatorOrderFile);
    const validatedLocators = maybeLocators.map(validateLocator);
    const locators = isApplyLocatorOrder
        ? validatedLocators.sort(compareLocator(locatorOrder))
        : validatedLocators;
    const promises = locators.map((locator) => findElement(locator));
    const findElementResults = await Promise.allSettled(promises);
    const correctElement = findElementResults.find(locatorCheck.isFound)?.value;
    if (correctElement === undefined) {
        throw new selenium_webdriver_1.error.NoSuchElementError(`Unable to locate element by any locators:` + JSON.stringify(locators));
    }
    const fixFilter = await Promise.all(locators.map(async (locator, i) => locatorCheck.isNotFound(findElementResults[i]) ||
        isDifferent(await findElement(locator), correctElement)));
    const brokenLocators = locators.filter((_, i) => fixFilter[i]);
    if (brokenLocators.length !== 0) {
        const { locatorCodeFragments } = await getCodeFragments(invocationInfo);
        await codeFixRegister.registerLocatorFix(correctElement, brokenLocators, locatorCodeFragments);
    }
    return correctElement;
};
exports.findElementAndRegisterLocatorFix = findElementAndRegisterLocatorFix;
const findElementAndRegisterLocatorExtension = async (invocationInfo, codeFixRegister, findElement, maybeLocator) => {
    const locator = validateLocator(maybeLocator);
    const correctElement = await findElement(locator);
    const { argumentsCodeFragment, methodInvocationCodeFragment } = await getCodeFragments(invocationInfo);
    await codeFixRegister.registerLocatorExtension(locator, correctElement, argumentsCodeFragment, methodInvocationCodeFragment);
    return correctElement;
};
exports.findElementAndRegisterLocatorExtension = findElementAndRegisterLocatorExtension;
/**
 * A lazy way to determine equivalence between elements
 * @param maybeBroken
 * @param correctElement
 * @returns is different or not
 */
const isDifferent = async (maybeBroken, correctElement) => {
    const a = await maybeBroken.getAttribute("outerHTML");
    const b = await correctElement.getAttribute("outerHTML");
    return a !== b;
};
const compareLocator = (locatorOrder) => (a, b) => {
    const orderA = locatorOrder.get(a.type);
    const orderB = locatorOrder.get(b.type);
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
const getCodeFragments = async (invocationInfo) => {
    const { file, lineNum } = invocationInfo;
    const data = await (0, promises_1.readFile)(file, "utf-8");
    const lines = data.split("\n");
    const invocationCode = lines.slice(lineNum - 1).join("\n");
    return (0, MethodInvocationParser_1.parse)(invocationCode, invocationInfo);
};
const isLocator = (maybeLocator) => {
    if (maybeLocator === null || typeof maybeLocator !== "object") {
        return false;
    }
    const entries = Object.entries(maybeLocator);
    if (entries.length !== 1) {
        return false;
    }
    const type = entries[0][0];
    const value = entries[0][1];
    if (Types_1.TargetLocatorTypes.includes(type) &&
        typeof value === "string") {
        return true;
    }
    return false;
};
const validateLocator = (maybeLocator) => {
    if (!isLocator(maybeLocator)) {
        throw new Error('locator format error: locators should be {type: "value"}');
    }
    const locator = Object.entries(maybeLocator)[0];
    const type = locator[0];
    const value = locator[1];
    return { type, value };
};
//# sourceMappingURL=MultiLocator.js.map