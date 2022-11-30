import { CodeFixer } from "./CodeFixer";
import { InvocationInfo } from "./MethodInvocationParser";
import { seleniumProxy } from "./proxy/SeleniumProxy";
import { wdioProxy } from "./proxy/WdioProxy";
import { FindElement, GetElementPromiseByDriver, TargetDriver } from "./Types";
import { isSelenium } from "./WebDriverUtil";

export const enableMultiLocator = (driver: TargetDriver): TargetDriver => {
  return isSelenium(driver) ? seleniumProxy(driver) : wdioProxy(driver);
};

type OverriddenFunctions<T extends TargetDriver> = {
  findElementMulti: (
    driver: T,
    invocationInfo: InvocationInfo,
    codeFixer: CodeFixer<T>,
    isApplyLocatorOrder: boolean,
    ...locators: unknown[]
  ) => GetElementPromiseByDriver<T>;

  findElement: (
    driver: T,
    invocationInfo: InvocationInfo,
    codeFixer: CodeFixer<T>,
    findElement: FindElement<T>,
    locator: unknown
  ) => GetElementPromiseByDriver<T>;
};

export const createProxy = <T extends TargetDriver>(
  driver: T,
  overriddenFunctions: OverriddenFunctions<T>
): T => new Proxy(driver, createProxyHandler(driver, overriddenFunctions));

const createProxyHandler = <T extends TargetDriver>(
  driver: T,
  { findElement, findElementMulti }: OverriddenFunctions<T>
): ProxyHandler<T> => {
  let codeFixer: CodeFixer<T> = new CodeFixer<T>(driver);
  return {
    get: (driver: T, prop, receiver) => {
      if (prop === "findElementMulti") {
        const invocationInfo = getInvocationInfo();
        return findElementMulti.bind(
          null,
          driver,
          invocationInfo,
          codeFixer,
          true
        );
      }
      if (prop === "findElementMultiStrict") {
        const invocationInfo = getInvocationInfo();
        return findElementMulti.bind(
          null,
          driver,
          invocationInfo,
          codeFixer,
          false
        );
      }
      if (prop === "findElement") {
        const invocationInfo = getInvocationInfo();
        return findElement.bind(null, driver, invocationInfo, codeFixer);
      }
      if (prop === "recordFix") {
        return codeFixer.recordFix;
      }
      return Reflect.get(driver, prop, receiver);
    },
  };
};

/**
 * Be careful not to change stack trace.
 * Note that the stack trace format is different for test scripts in .js and .ts.
 * Parentheses are included only for .js.
 */
const getInvocationInfo = (): InvocationInfo => {
  const stack = new Error().stack!.split("\n")[3];
  const result = /.+ \(*(.+):(.+):(.+)\)*/.exec(stack);
  if (result === null) {
    throw new Error("cannot get invocation info");
  }
  return {
    file: result[1],
    lineNum: parseInt(result[2]),
    at: parseInt(result[3]),
  };
};
