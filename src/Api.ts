import { seleniumProxy } from "./proxy/SeleniumProxy";
import { wdioProxy } from "./proxy/WdioProxy";
import { TargetDriver } from "./Types";
import { isSelenium } from "./WebDriverUtil";
import Log4js from "log4js";
import { CodeFixWriter } from "./CodeFixer";

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

export const enableMultiLocator = (driver: TargetDriver): TargetDriver => {
  return isSelenium(driver) ? seleniumProxy(driver) : wdioProxy(driver);
};

export const recordFix = (): Promise<void> => new CodeFixWriter().recordFix();
