import { CodeFixer } from "./CodeFixer";
import { InvocationInfo } from "./MethodInvocationParser";
import { findElementMultiSelenium, findElementMultiWdio } from "./MultiLocator";
import { GetElementPromiseByDriver, TargetDriver } from "./Types";
import { isSelenium } from "./WebDriverUtil";

export const enableFindElementMulti = (driver: TargetDriver): TargetDriver => {
  return isSelenium(driver)
    ? new Proxy(driver, createDriverHandler(findElementMultiSelenium))
    : new Proxy(driver, createDriverHandler(findElementMultiWdio));
};

let codeFixer: CodeFixer | undefined = undefined;

const createDriverHandler = <T extends TargetDriver>(
  findElementMulti: (
    driver: T,
    invocationInfo: InvocationInfo,
    codeFixer: CodeFixer,
    ...locators: unknown[]
  ) => GetElementPromiseByDriver<T>
): ProxyHandler<T> => {
  return {
    get: (driver: T, prop, receiver) => {
      if (prop === "findElementMulti") {
        const invocationInfo = getInvocationInfo();
        if (codeFixer === undefined) {
          codeFixer = new CodeFixer();
        }
        return findElementMulti.bind(null, driver, invocationInfo, codeFixer);
      }
      if (prop === "recordFix" && codeFixer !== undefined) {
        return codeFixer.recordFix;
      }
      return Reflect.get(driver, prop, receiver);
    },
  };
};

/**
 * Be careful not to change stack trace
 */
const getInvocationInfo = (): InvocationInfo => {
  const stack = new Error().stack!.split("\n")[3];
  const result = /.+\((.+):(.+):(.+)\)/.exec(stack);
  if (result === null) {
    throw new Error("cannot get invocation info");
  }
  return {
    file: result[1],
    lineNum: parseInt(result[2]),
    at: parseInt(result[3]) - 1,
  };
};
