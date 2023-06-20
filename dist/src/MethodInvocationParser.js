"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
var parse = function (invocationCode, invocationInfo) {
    var collector = new CodeFragmentsCollector(invocationCode, invocationInfo);
    collector.parseInvocation();
    return collector.codeFragments;
};
exports.parse = parse;
/**
 * contains locator code fragments for one method invocation
 */
var CodeFragmentsCollector = /** @class */ (function () {
    function CodeFragmentsCollector(_invocationCode, invocationInfo) {
        var _this = this;
        this._invocationCode = _invocationCode;
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
        this.parseInvocation = function () {
            var start = _this._index;
            var startAt = _this._at;
            while (_this.currentChar() !== "(") {
                _this.nextSkipWhiteSpace();
            }
            var end = _this._index;
            var endAt = _this._at;
            var methodName = _this._invocationCode.substring(start, end);
            _this._codeFragmentsContainer.registerMethodInvocation(methodName, _this._lineNum, startAt, endAt);
            _this.parseArgument();
        };
        this.next = function () {
            if (_this.currentChar() === "\n") {
                _this._index++;
                _this._lineNum++;
                _this._at = 1;
            }
            else {
                _this._index++;
                _this._at++;
            }
        };
        this.nextSkipWhiteSpace = function () {
            do {
                _this.next();
            } while (/\s/.test(_this.currentChar()));
        };
        this.currentChar = function () {
            return _this._invocationCode[_this._index];
        };
        this.parseArgument = function () {
            if (_this.currentChar() !== "(") {
                throw new Error("argument parse error");
            }
            _this.nextSkipWhiteSpace();
            var start = _this._index;
            var startAt = _this._at;
            var lineNum = _this._lineNum;
            _this.parseLocators();
            var end = _this._index;
            var endAt = _this._at;
            var argumentsString = _this._invocationCode.substring(start, end);
            _this._codeFragmentsContainer.registerArguments(argumentsString, lineNum, startAt, endAt);
        };
        this.parseLocators = function () {
            _this.parseLocator();
            while (_this.currentChar() !== ")") {
                _this.nextSkipWhiteSpace();
                // considering trailing comma
                if (_this.currentChar() === ")") {
                    break;
                }
                _this.parseLocator();
            }
        };
        this.parseLocator = function () {
            if (_this.currentChar() !== "{") {
                throw new Error("locator parse error");
            }
            _this.parseLocatorType();
            if (_this.currentChar() !== ":") {
                throw new Error("locator parse error");
            }
            _this.nextSkipWhiteSpace();
            _this.parseLocatorValue();
            if (_this.currentChar() !== "}") {
                throw new Error("locator parse error");
            }
            _this.nextSkipWhiteSpace();
        };
        this.parseLocatorType = function () {
            _this.nextSkipWhiteSpace();
            var start = _this._index;
            var startAt = _this._at;
            // considering inserted space before ":"
            while (_this.currentChar() !== ":" && !/\s/.test(_this.currentChar())) {
                _this.next();
            }
            var end = _this._index;
            var endAt = _this._at;
            while (_this.currentChar() !== ":") {
                _this.nextSkipWhiteSpace();
            }
            var locatorType = _this._invocationCode.substring(start, end);
            _this._codeFragmentsContainer.registerLocatorType(locatorType, _this._lineNum, startAt, endAt);
        };
        this.surroundingSymbols = ["'", '"', "`"];
        this.parseLocatorValue = function () {
            while (!_this.surroundingSymbols.includes(_this.currentChar())) {
                _this.nextSkipWhiteSpace();
            }
            var surroundingSymbol = _this.currentChar();
            var start = _this._index;
            var startAt = _this._at;
            _this.nextSkipWhiteSpace();
            while (_this.currentChar() !== surroundingSymbol) {
                _this.nextSkipWhiteSpace();
            }
            var end = _this._index + 1;
            var endAt = _this._at + 1;
            var locatorValue = _this._invocationCode.substring(start, end);
            _this._codeFragmentsContainer.registerLocatorValue(locatorValue, _this._lineNum, startAt, endAt);
            while (_this.currentChar() !== "}") {
                _this.nextSkipWhiteSpace();
            }
        };
        this._index = invocationInfo.at - 1;
        this._lineNum = invocationInfo.lineNum;
        this._at = invocationInfo.at;
        this._codeFragmentsContainer = new CodeFragmentsContainer(invocationInfo.file);
    }
    Object.defineProperty(CodeFragmentsCollector.prototype, "codeFragments", {
        get: function () {
            return {
                locatorCodeFragments: this._codeFragmentsContainer.locatorCodeFragments,
                argumentsCodeFragment: this._codeFragmentsContainer.argumentsCodeFragment,
                methodInvocationCodeFragment: this._codeFragmentsContainer.methodInvocationCodeFragment,
            };
        },
        enumerable: false,
        configurable: true
    });
    return CodeFragmentsCollector;
}());
var CodeFragmentsContainer = /** @class */ (function () {
    function CodeFragmentsContainer(file) {
        var _this = this;
        this.file = file;
        this._methodInvocationCodeFragment = undefined;
        this._argumentsCodeFragment = undefined;
        this._locatorCodeFragments = [];
        this._tmpLocatorTypeCodeFragment = undefined;
        this.registerMethodInvocation = function (string, lineNum, start, end) {
            _this._methodInvocationCodeFragment = {
                string: string,
                file: _this.file,
                lineNum: lineNum,
                start: start,
                end: end,
            };
        };
        this.registerArguments = function (string, lineNum, start, end) {
            _this._argumentsCodeFragment = {
                string: string,
                file: _this.file,
                lineNum: lineNum,
                start: start,
                end: end,
            };
        };
        this.registerLocatorType = function (locatorType, lineNum, start, end) {
            _this._tmpLocatorTypeCodeFragment = {
                string: locatorType,
                file: _this.file,
                lineNum: lineNum,
                start: start,
                end: end,
            };
        };
        this.registerLocatorValue = function (locatorValue, lineNum, start, end) {
            if (_this._tmpLocatorTypeCodeFragment === undefined) {
                throw new Error("temporary locator type is undefined");
            }
            var locatorValueCodeFragment = {
                string: locatorValue,
                file: _this.file,
                lineNum: lineNum,
                start: start,
                end: end,
            };
            var locatorCodeFragment = {
                type: _this._tmpLocatorTypeCodeFragment,
                value: locatorValueCodeFragment,
            };
            _this._locatorCodeFragments.push(locatorCodeFragment);
        };
    }
    Object.defineProperty(CodeFragmentsContainer.prototype, "methodInvocationCodeFragment", {
        get: function () {
            if (this._methodInvocationCodeFragment === undefined) {
                throw new Error("undefined method invocation code");
            }
            return this._methodInvocationCodeFragment;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CodeFragmentsContainer.prototype, "argumentsCodeFragment", {
        get: function () {
            if (this._argumentsCodeFragment === undefined) {
                throw new Error("undefined arguments code");
            }
            return this._argumentsCodeFragment;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CodeFragmentsContainer.prototype, "locatorCodeFragments", {
        get: function () {
            return this._locatorCodeFragments;
        },
        enumerable: false,
        configurable: true
    });
    return CodeFragmentsContainer;
}());
//# sourceMappingURL=MethodInvocationParser.js.map