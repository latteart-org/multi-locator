export declare type InvocationInfo = {
    file: string;
    lineNum: number;
    at: number;
};
export declare const parse: (invocationCode: string, invocationInfo: InvocationInfo) => ParsedCodeFragments;
export declare type ParsedCodeFragments = {
    methodInvocationCodeFragment: CodeFragment;
    argumentsCodeFragment: CodeFragment;
    locatorCodeFragments: LocatorCodeFragment[];
};
export declare type LocatorCodeFragment = {
    type: CodeFragment;
    value: CodeFragment;
};
export declare type CodeFragment = {
    file: string;
    string: string;
    lineNum: number;
    start: number;
    end: number;
};
