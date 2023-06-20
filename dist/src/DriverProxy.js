"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProxy = void 0;
var CodeFixer_1 = require("./CodeFixer");
var createProxy = function (driver, overriddenFunctions) { return new Proxy(driver, createProxyHandler(driver, overriddenFunctions)); };
exports.createProxy = createProxy;
var createProxyHandler = function (driver, _a) {
    var findElement = _a.findElement, findElementMulti = _a.findElementMulti;
    var codeFixRegister = new CodeFixer_1.CodeFixRegister(driver);
    return {
        get: function (driver, prop, receiver) {
            if (prop === "findElementMulti") {
                var invocationInfo = getInvocationInfo();
                return findElementMulti.bind(null, driver, invocationInfo, codeFixRegister, true);
            }
            if (prop === "findElementMultiStrict") {
                var invocationInfo = getInvocationInfo();
                return findElementMulti.bind(null, driver, invocationInfo, codeFixRegister, false);
            }
            if (prop === "findElement") {
                var invocationInfo = getInvocationInfo();
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
var getInvocationInfo = function () {
    var stack = new Error().stack.split("\n")[3];
    var result = /.+ \(*(.+):(.+):(.+)\)*/.exec(stack);
    if (result === null) {
        throw new Error("cannot get invocation info");
    }
    return {
        file: result[1],
        lineNum: parseInt(result[2]),
        at: parseInt(result[3]),
    };
};
//# sourceMappingURL=DriverProxy.js.map