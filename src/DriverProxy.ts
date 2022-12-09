import { CodeFixRegister } from "./CodeFixer";
import { InvocationInfo } from "./MethodInvocationParser";
import { FindElement, GetElementPromiseByDriver, TargetDriver } from "./Types";

type OverriddenFunctions<T extends TargetDriver> = {
  findElementMulti: (
    driver: T,
    invocationInfo: InvocationInfo,
    codeFixRegister: CodeFixRegister<T>,
    isApplyLocatorOrder: boolean,
    ...locators: unknown[]
  ) => GetElementPromiseByDriver<T>;

  findElement: (
    driver: T,
    invocationInfo: InvocationInfo,
    codeFixRegister: CodeFixRegister<T>,
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
  let codeFixRegister: CodeFixRegister<T> = new CodeFixRegister<T>(driver);
  return {
    get: (driver: T, prop, receiver) => {
      if (prop === "findElementMulti") {
        const invocationInfo = getInvocationInfo();
        return findElementMulti.bind(
          null,
          driver,
          invocationInfo,
          codeFixRegister,
          true
        );
      }
      if (prop === "findElementMultiStrict") {
        const invocationInfo = getInvocationInfo();
        return findElementMulti.bind(
          null,
          driver,
          invocationInfo,
          codeFixRegister,
          false
        );
      }
      if (prop === "findElement") {
        const invocationInfo = getInvocationInfo();
        return findElement.bind(null, driver, invocationInfo, codeFixRegister);
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
