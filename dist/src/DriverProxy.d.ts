import { CodeFixRegister } from "./CodeFixer";
import { InvocationInfo } from "./MethodInvocationParser";
import { FindElement, GetElementPromiseByDriver, TargetDriver } from "./Types";
declare type OverriddenFunctions<T extends TargetDriver> = {
    findElementMulti: (driver: T, invocationInfo: InvocationInfo, codeFixRegister: CodeFixRegister<T>, isApplyLocatorOrder: boolean, ...locators: unknown[]) => GetElementPromiseByDriver<T>;
    findElement: (driver: T, invocationInfo: InvocationInfo, codeFixRegister: CodeFixRegister<T>, findElement: FindElement<T>, locator: unknown) => GetElementPromiseByDriver<T>;
};
export declare const createProxy: <T extends TargetDriver>(driver: T, overriddenFunctions: OverriddenFunctions<T>) => T;
export {};
