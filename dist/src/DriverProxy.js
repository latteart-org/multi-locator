"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProxy = void 0;
const CodeFixer_1 = require("./CodeFixer");
const createProxy = (driver, overriddenFunctions) => new Proxy(driver, createProxyHandler(driver, overriddenFunctions));
exports.createProxy = createProxy;
const createProxyHandler = (driver, { findElement, findElementMulti }) => {
    let codeFixRegister = new CodeFixer_1.CodeFixRegister(driver);
    return {
        get: (driver, prop, receiver) => {
            if (prop === "findElementMulti") {
                const invocationInfo = getInvocationInfo();
                return findElementMulti.bind(null, driver, invocationInfo, codeFixRegister, true);
            }
            if (prop === "findElementMultiStrict") {
                const invocationInfo = getInvocationInfo();
                return findElementMulti.bind(null, driver, invocationInfo, codeFixRegister, false);
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
const getInvocationInfo = () => {
    const stack = new Error().stack.split("\n")[3];
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
//# sourceMappingURL=DriverProxy.js.map