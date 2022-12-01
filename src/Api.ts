import { seleniumProxy } from "./proxy/SeleniumProxy";
import { wdioProxy } from "./proxy/WdioProxy";
import { TargetDriver } from "./Types";
import { isSelenium } from "./WebDriverUtil";
import Log4js from "log4js";

export const enableMultiLocator = (driver: TargetDriver): TargetDriver => {
  return isSelenium(driver) ? seleniumProxy(driver) : wdioProxy(driver);
};

Log4js.configure({
  appenders: {
    stdout: {
      type: "stdout",
    },
  },
  categories: {
    default: {
      appenders: ["stdout"],
      level: "info",
    },
  },
});
