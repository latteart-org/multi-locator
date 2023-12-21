"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const parse = (invocationCode, invocationInfo) => {
    const collector = new CodeFragmentsCollector(invocationCode, invocationInfo);
    collector.parseInvocation();
    return collector.codeFragments;
};
exports.parse = parse;
/**
 * contains locator code fragments for one method invocation
 */
class CodeFragmentsCollector {
    _invocationCode;
    /**
     * current index for "target" string
     */
    _index;
    _lineNum;
    /**
     * current index in this line
     */
    _at;
    _codeFragmentsContainer;
    constructor(_invocationCode, invocationInfo) {
        this._invocationCode = _invocationCode;
        this._index = invocationInfo.at - 1;
        this._lineNum = invocationInfo.lineNum;
        this._at = invocationInfo.at;
        this._codeFragmentsContainer = new CodeFragmentsContainer(invocationInfo.file);
    }
    get codeFragments() {
        return {
            locatorCodeFragments: this._codeFragmentsContainer.locatorCodeFragments,
            argumentsCodeFragment: this._codeFragmentsContainer.argumentsCodeFragment,
            methodInvocationCodeFragment: this._codeFragmentsContainer.methodInvocationCodeFragment,
        };
    }
    /**
     * ignore white spaces
     * Suppose that there is no comment out
     * @example
     * <invocation> ::= 'findElementMulti' <argument>
     * <argument> ::= '(' <locators> ')'
     * <locators> ::= <locator> (,<locator>)+
     * <locator> ::= '{' <locator type> : <symbol><locator value><symbol> '}'
     * <symbol> ::= ' | " | `
     */
    parseInvocation = () => {
        const start = this._index;
        const startAt = this._at;
        while (this.currentChar() !== "(") {
            this.nextSkipWhiteSpace();
        }
        const end = this._index;
        const endAt = this._at;
        const methodName = this._invocationCode.substring(start, end);
        this._codeFragmentsContainer.registerMethodInvocation(methodName, this._lineNum, startAt, endAt);
        this.parseArgument();
    };
    next = () => {
        if (this.currentChar() === "\n") {
            this._index++;
            this._lineNum++;
            this._at = 1;
        }
        else {
            this._index++;
            this._at++;
        }
    };
    nextSkipWhiteSpace = () => {
        do {
            this.next();
        } while (/\s/.test(this.currentChar()));
    };
    currentChar = () => {
        return this._invocationCode[this._index];
    };
    parseArgument = () => {
        if (this.currentChar() !== "(") {
            throw new Error("argument parse error");
        }
        this.nextSkipWhiteSpace();
        const start = this._index;
        const startAt = this._at;
        const lineNum = this._lineNum;
        this.parseLocators();
        const end = this._index;
        const endAt = this._at;
        const argumentsString = this._invocationCode.substring(start, end);
        this._codeFragmentsContainer.registerArguments(argumentsString, lineNum, startAt, endAt);
    };
    parseLocators = () => {
        this.parseLocator();
        while (this.currentChar() !== ")") {
            this.nextSkipWhiteSpace();
            // considering trailing comma
            if (this.currentChar() === ")") {
                break;
            }
            this.parseLocator();
        }
    };
    parseLocator = () => {
        if (this.currentChar() !== "{") {
            throw new Error("locator parse error");
        }
        this.parseLocatorType();
        if (this.currentChar() !== ":") {
            throw new Error("locator parse error");
        }
        this.nextSkipWhiteSpace();
        this.parseLocatorValue();
        if (this.currentChar() !== "}") {
            throw new Error("locator parse error");
        }
        this.nextSkipWhiteSpace();
    };
    parseLocatorType = () => {
        this.nextSkipWhiteSpace();
        const start = this._index;
        const startAt = this._at;
        // considering inserted space before ":"
        while (this.currentChar() !== ":" && !/\s/.test(this.currentChar())) {
            this.next();
        }
        const end = this._index;
        const endAt = this._at;
        while (this.currentChar() !== ":") {
            this.nextSkipWhiteSpace();
        }
        const locatorType = this._invocationCode.substring(start, end);
        this._codeFragmentsContainer.registerLocatorType(locatorType, this._lineNum, startAt, endAt);
    };
    surroundingSymbols = ["'", '"', "`"];
    parseLocatorValue = () => {
        while (!this.surroundingSymbols.includes(this.currentChar())) {
            this.nextSkipWhiteSpace();
        }
        const surroundingSymbol = this.currentChar();
        const start = this._index;
        const startAt = this._at;
        this.nextSkipWhiteSpace();
        while (this.currentChar() !== surroundingSymbol) {
            this.nextSkipWhiteSpace();
        }
        const end = this._index + 1;
        const endAt = this._at + 1;
        const locatorValue = this._invocationCode.substring(start, end);
        this._codeFragmentsContainer.registerLocatorValue(locatorValue, this._lineNum, startAt, endAt);
        while (this.currentChar() !== "}") {
            this.nextSkipWhiteSpace();
        }
    };
}
class CodeFragmentsContainer {
    file;
    _methodInvocationCodeFragment = undefined;
    _argumentsCodeFragment = undefined;
    _locatorCodeFragments = [];
    _tmpLocatorTypeCodeFragment = undefined;
    constructor(file) {
        this.file = file;
    }
    get methodInvocationCodeFragment() {
        if (this._methodInvocationCodeFragment === undefined) {
            throw new Error("undefined method invocation code");
        }
        return this._methodInvocationCodeFragment;
    }
    get argumentsCodeFragment() {
        if (this._argumentsCodeFragment === undefined) {
            throw new Error("undefined arguments code");
        }
        return this._argumentsCodeFragment;
    }
    get locatorCodeFragments() {
        return this._locatorCodeFragments;
    }
    registerMethodInvocation = (string, lineNum, start, end) => {
        this._methodInvocationCodeFragment = {
            string,
            file: this.file,
            lineNum,
            start,
            end,
        };
    };
    registerArguments = (string, lineNum, start, end) => {
        this._argumentsCodeFragment = {
            string,
            file: this.file,
            lineNum,
            start,
            end,
        };
    };
    registerLocatorType = (locatorType, lineNum, start, end) => {
        this._tmpLocatorTypeCodeFragment = {
            string: locatorType,
            file: this.file,
            lineNum,
            start,
            end,
        };
    };
    registerLocatorValue = (locatorValue, lineNum, start, end) => {
        if (this._tmpLocatorTypeCodeFragment === undefined) {
            throw new Error("temporary locator type is undefined");
        }
        const locatorValueCodeFragment = {
            string: locatorValue,
            file: this.file,
            lineNum,
            start,
            end,
        };
        const locatorCodeFragment = {
            type: this._tmpLocatorTypeCodeFragment,
            value: locatorValueCodeFragment,
        };
        this._locatorCodeFragments.push(locatorCodeFragment);
    };
}
//# sourceMappingURL=MethodInvocationParser.js.map