import { ThenableWebDriver, WebElement } from "selenium-webdriver";
import { Browser, Element } from "webdriverio";

export type SeleniumDriver = ThenableWebDriver;
export type SeleniumElement = WebElement;
export type WdioDriver = Browser<"async">;
export type WdioElement = Element<"async">;

export type TargetDriver = SeleniumDriver | WdioDriver;

export type FindElement<T extends TargetDriver> = (
  locator: TargetLocator
) => GetElementPromiseByDriver<T>;

export type GetRawElementByDriver<T> = T extends SeleniumDriver
  ? SeleniumElement
  : WdioElement;

export type GetElementPromiseByDriver<T extends TargetDriver> = Promise<
  GetRawElementByDriver<T>
>;

export type GetAwaitedElementByDriver<T extends TargetDriver> = Awaited<
  GetElementPromiseByDriver<T>
>;

export type GetElementByDriver<T extends TargetDriver> =
  | GetRawElementByDriver<T>
  | GetAwaitedElementByDriver<T>;

export const TargetLocatorTypes = [
  "id",
  "name",
  "linkText",
  "partialLinkText",
  "innerText",
  "partialInnerText",
  "css",
  "xpath",
] as const;
export type TargetLocator = {
  type: (typeof TargetLocatorTypes)[number];
  value: string;
};
