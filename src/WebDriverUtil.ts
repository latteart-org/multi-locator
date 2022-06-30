import { By, ByHash, ThenableWebDriver, WebDriver } from "selenium-webdriver";
import { Browser } from "webdriverio";
import { GetElementByDriver, TargetDriver, TargetLocator } from "./Types";

export const isSelenium = (
  driver: ThenableWebDriver | Browser<"async">
): driver is ThenableWebDriver => driver instanceof WebDriver;

export const findElementCommon = async <T extends TargetDriver>(
  driver: T,
  locator: TargetLocator
): Promise<GetElementByDriver<T>> => {
  return isSelenium(driver)
    ? await driver.findElement(toSeleniumCompatible(locator))
    : await driver.$(toWdioCompatible(locator));
};

export const toWdioCompatible = (locator: TargetLocator): string => {
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

export const toSeleniumCompatible = (locator: TargetLocator): ByHash => {
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
    return null;
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
