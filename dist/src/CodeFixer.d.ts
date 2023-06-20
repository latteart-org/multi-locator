import { CodeFragment, LocatorCodeFragment } from "./MethodInvocationParser";
import { GetAwaitedElementByDriver, GetElementByDriver, TargetDriver, TargetLocator } from "./Types";
export declare type LocatorFix = {
    locatorCodeFragment: LocatorCodeFragment;
    correctValue: string;
    time: number;
};
export declare type LocatorExtension = {
    argumentsCodeFragment: CodeFragment;
    newArgumentsString: string;
};
export declare class CodeFixWriter {
    recordFix: () => Promise<void>;
    private getSource;
    private applyLocatorFix;
    private applyLocatorExtension;
    private writeFixHistory;
    private writeFixedSource;
}
export declare class CodeFixRegister<T extends TargetDriver> {
    private readonly driver;
    constructor(driver: T);
    registerLocatorFix: (element: GetAwaitedElementByDriver<T>, brokenLocators: TargetLocator[], locatorCodeFragments: LocatorCodeFragment[]) => Promise<void>;
    /**
     * Sort by value's end position (backward first)
     * If more than one fixes is made on a single line, the fixes must be applied from behind.
     * @param a
     * @param b
     * @returns
     */
    private compareLocatorFix;
    registerLocatorExtension: (element: GetElementByDriver<T>, argumentsCodeFragment: CodeFragment, methodInvocationCodeFragment: CodeFragment) => Promise<void>;
    private getBrokenLocatorCodeFragment;
    /**
     * Needs improvement as it does not consider uniqueness of elements
     * @param element
     * @param type
     * @returns
     */
    private getLocatorValue;
}
