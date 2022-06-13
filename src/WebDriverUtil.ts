import { By, ThenableWebDriver, WebDriver } from "selenium-webdriver";
import { Browser } from "webdriverio";
import { GetElementByDriver, TargetDriver } from "./Types";

export const isSelenium = (
  driver: ThenableWebDriver | Browser<"async">
): driver is ThenableWebDriver => driver instanceof WebDriver;

export const getXpath = async <T extends TargetDriver>(
  driver: T,
  element: GetElementByDriver<T>
): Promise<string> => {
  if (isSelenium(driver)) {
    return await driver.executeAsyncScript(getXpathInject, element);
  } else {
    return await driver.executeAsync(getXpathInject, element);
  }
};

/**
 * @param driver
 * @param element
 * @returns Selector by the product set of all classes in this element. Return null if class doesn't exist.
 */
export const getCssSelector = async <T extends TargetDriver>(
  driver: T,
  element: GetElementByDriver<T>
): Promise<string | null> => {
  const classString = await element.getAttribute("class");
  if (classString === null) {
    return null;
  }
  const classes = classString.split(/\s+/);
  const cssSelector = "." + classes.join(".");
  const elements = isSelenium(driver)
    ? await driver.findElements(By.css(cssSelector))
    : await driver.$$(cssSelector);
  if (elements.length === 1) {
    return cssSelector;
  } else {
    return "valid locator cannot generated";
  }
};

function getXpathInject() {
  const getXpathRec = (element: any) => {
    if (element && element.parentNode) {
      let xpath: string =
        getXpathRec(element.parentNode) + "/" + element.tagName;
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
    } else {
      return "";
    }
  };
  const callback = arguments[arguments.length - 1];
  const element = arguments[0];
  const xpath = getXpathRec(element);
  callback(xpath);
}
