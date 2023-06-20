import { ThenableWebDriver, WebElement } from "selenium-webdriver";
import { Browser, Element } from "webdriverio";
export declare type SeleniumDriver = ThenableWebDriver;
export declare type SeleniumElement = WebElement;
export declare type WdioDriver = Browser<"async">;
export declare type WdioElement = Element<"async">;
export declare type TargetDriver = SeleniumDriver | WdioDriver;
export declare type FindElement<T extends TargetDriver> = (locator: TargetLocator) => GetElementPromiseByDriver<T>;
export declare type GetRawElementByDriver<T> = T extends SeleniumDriver ? SeleniumElement : WdioElement;
export declare type GetElementPromiseByDriver<T extends TargetDriver> = Promise<GetRawElementByDriver<T>>;
export declare type GetAwaitedElementByDriver<T extends TargetDriver> = Awaited<GetElementPromiseByDriver<T>>;
export declare type GetElementByDriver<T extends TargetDriver> = GetRawElementByDriver<T> | GetAwaitedElementByDriver<T>;
export declare const TargetLocatorTypes: readonly ["id", "name", "xpath", "linkText", "partialLinkText", "innerText", "partialInnerText", "css"];
export declare type TargetLocator = {
    type: typeof TargetLocatorTypes[number];
    value: string;
};
