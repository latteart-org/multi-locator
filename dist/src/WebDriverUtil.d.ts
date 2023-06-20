import { GetElementByDriver, SeleniumDriver, TargetDriver, WdioDriver } from "./Types";
export declare const isSelenium: (driver: SeleniumDriver | WdioDriver) => driver is import("selenium-webdriver").ThenableWebDriver;
export declare const getXpath: <T extends TargetDriver>(driver: T, element: GetElementByDriver<T>) => Promise<string>;
/**
 * @param driver
 * @param element
 * @returns Selector by the product set of all classes in this element. Return null if class doesn't exist.
 */
export declare const getCssSelector: <T extends TargetDriver>(driver: T, element: GetElementByDriver<T>) => Promise<string | undefined>;
