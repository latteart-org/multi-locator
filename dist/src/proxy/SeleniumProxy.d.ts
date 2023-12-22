import { ByHash } from "selenium-webdriver";
import { SeleniumDriver, TargetLocator } from "../Types";
export declare const seleniumProxy: (driver: SeleniumDriver) => SeleniumDriver;
export declare const toSeleniumCompatible: (locator: TargetLocator) => ByHash;
