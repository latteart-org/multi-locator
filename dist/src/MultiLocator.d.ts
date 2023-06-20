import { CodeFixRegister } from "./CodeFixer";
import { InvocationInfo } from "./MethodInvocationParser";
import { FindElement, GetAwaitedElementByDriver, GetRawElementByDriver, TargetDriver } from "./Types";
export declare type LocatorCheck<T extends TargetDriver> = {
    isFound: (result: PromiseSettledResult<GetAwaitedElementByDriver<T>>) => result is PromiseFulfilledResult<GetAwaitedElementByDriver<T>>;
    isNotFound: (result: PromiseSettledResult<GetAwaitedElementByDriver<T>>) => boolean;
};
export declare const findElementAndRegisterLocatorFix: <T extends TargetDriver>(invocationInfo: InvocationInfo, codeFixRegister: CodeFixRegister<T>, maybeLocators: unknown[], findElement: FindElement<T>, locatorCheck: LocatorCheck<T>, isApplyLocatorOrder: boolean) => Promise<Awaited<GetRawElementByDriver<T>>>;
export declare const findElementAndRegisterLocatorExtension: <T extends TargetDriver>(invocationInfo: InvocationInfo, codeFixRegister: CodeFixRegister<T>, findElement: FindElement<T>, maybeLocator: unknown) => Promise<GetRawElementByDriver<T>>;
