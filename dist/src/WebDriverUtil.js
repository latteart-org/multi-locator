"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCssSelector = exports.getXpath = exports.isSelenium = void 0;
const selenium_webdriver_1 = require("selenium-webdriver");
const isSelenium = (driver) => driver instanceof selenium_webdriver_1.WebDriver;
exports.isSelenium = isSelenium;
const getXpath = async (driver, element) => {
    function getXpathInject() {
        const getXpathRec = (element) => {
            if (element && element.parentNode) {
                let xpath = getXpathRec(element.parentNode) + "/" + element.tagName;
                const s = [];
                for (let i = 0; i < element.parentNode.childNodes.length; i++) {
                    const e = element.parentNode.childNodes[i];
                    if (e.tagName == element.tagName) {
                        s.push(e);
                    }
                }
                if (1 < s.length) {
                    for (let i = 0; i < s.length; i++) {
                        if (s[i] === element) {
                            xpath += "[" + (i + 1) + "]";
                            break;
                        }
                    }
                }
                return xpath.toLowerCase();
            }
            else {
                return "";
            }
        };
        const callback = arguments[arguments.length - 1];
        const element = arguments[0];
        const xpath = getXpathRec(element);
        callback(xpath);
    }
    if ((0, exports.isSelenium)(driver)) {
        return await driver.executeAsyncScript(getXpathInject, element);
    }
    else {
        return await driver.executeAsync(getXpathInject, element);
    }
};
exports.getXpath = getXpath;
/**
 * @param driver
 * @param element
 * @returns Selector by the product set of all classes in this element. Return null if class doesn't exist.
 */
const getCssSelector = async (driver, element) => {
    const classString = await element.getAttribute("class");
    if (classString === null || classString === undefined || classString === "") {
        return undefined;
    }
    const classes = classString.split(/\s+/);
    const cssSelector = "." + classes.join(".");
    const elements = (0, exports.isSelenium)(driver)
        ? await driver.findElements(selenium_webdriver_1.By.css(cssSelector))
        : await driver.$$(cssSelector);
    if (elements.length === 1) {
        return cssSelector;
    }
    else {
        return undefined;
    }
};
exports.getCssSelector = getCssSelector;
//# sourceMappingURL=WebDriverUtil.js.map