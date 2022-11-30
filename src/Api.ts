import { seleniumProxy } from "./proxy/SeleniumProxy";
import { wdioProxy } from "./proxy/WdioProxy";
import { TargetDriver } from "./Types";
import { isSelenium } from "./WebDriverUtil";

export const enableMultiLocator = (driver: TargetDriver): TargetDriver => {
  return isSelenium(driver) ? seleniumProxy(driver) : wdioProxy(driver);
};
