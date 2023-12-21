"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordFix = exports.enableMultiLocator = void 0;
const SeleniumProxy_1 = require("./proxy/SeleniumProxy");
const WdioProxy_1 = require("./proxy/WdioProxy");
const WebDriverUtil_1 = require("./WebDriverUtil");
const log4js_1 = __importDefault(require("log4js"));
const CodeFixer_1 = require("./CodeFixer");
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
const enableMultiLocator = (driver) => {
    return (0, WebDriverUtil_1.isSelenium)(driver) ? (0, SeleniumProxy_1.seleniumProxy)(driver) : (0, WdioProxy_1.wdioProxy)(driver);
};
exports.enableMultiLocator = enableMultiLocator;
const recordFix = () => new CodeFixer_1.CodeFixWriter().recordFix();
exports.recordFix = recordFix;
//# sourceMappingURL=Api.js.map