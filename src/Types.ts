import { ThenableWebDriver, WebElement } from "selenium-webdriver";
import { Browser, Element } from "webdriverio";

export type TargetDriver = ThenableWebDriver | Browser<"async">;

export type GetElementPromiseByDriver<T extends TargetDriver> =
  T extends ThenableWebDriver ? Promise<WebElement> : Promise<Element<"async">>;

export type GetElementByDriver<T extends TargetDriver> = Awaited<
  GetElementPromiseByDriver<T>
>;

export const TargetLocatorTypes = [
  "id",
  "name",
  "xpath",
  "linkText",
  "partialLinkText",
  "innerText",
  "partialInnerText",
  "css",
] as const;
export type TargetLocator = {
  type: typeof TargetLocatorTypes[number];
  value: string;
};
