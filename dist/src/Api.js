"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordFix = exports.enableMultiLocator = void 0;
var SeleniumProxy_1 = require("./proxy/SeleniumProxy");
var WdioProxy_1 = require("./proxy/WdioProxy");
var WebDriverUtil_1 = require("./WebDriverUtil");
var log4js_1 = __importDefault(require("log4js"));
var CodeFixer_1 = require("./CodeFixer");
log4js_1.default.configure({
    appenders: {
        stdout: {
            type: "stdout",
        },
    },
    categories: {
        default: {
            appenders: ["stdout"],
            level: "info",
        },
    },
});
var enableMultiLocator = function (driver) {
    return (0, WebDriverUtil_1.isSelenium)(driver) ? (0, SeleniumProxy_1.seleniumProxy)(driver) : (0, WdioProxy_1.wdioProxy)(driver);
};
exports.enableMultiLocator = enableMultiLocator;
var recordFix = function () { return new CodeFixer_1.CodeFixWriter().recordFix(); };
exports.recordFix = recordFix;
//# sourceMappingURL=Api.js.map