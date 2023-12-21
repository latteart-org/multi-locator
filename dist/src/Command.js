#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const log4js_1 = __importDefault(require("log4js"));
const FilePathSetting_1 = require("./FilePathSetting");
const LocatorOrder_1 = require("./LocatorOrder");
log4js_1.default.configure({
    appenders: {
        stdout: {
            type: "stdout",
            layout: {
                type: "pattern",
                pattern: "%m",
            },
        },
    },
    categories: {
        default: {
            appenders: ["stdout"],
            level: "info",
        },
    },
});
const logger = log4js_1.default.getLogger();
if (process.argv[2] === "show") {
    if (process.argv[3] === "fix") {
        showFix(process.argv[4]);
    }
    else if (process.argv[3] === "order") {
        showOrder();
    }
    else {
        logger.error("Invalid argument: `muloc show (fix <file name> | order)`");
    }
}
else if (process.argv[2] === "apply") {
    if (process.argv[3] === "fix") {
        applyFix(process.argv[4]);
    }
    else if (process.argv[3] === "order") {
        applyOrder();
    }
    else {
        logger.error("Invalid argument: `muloc apply (fix <file path> | order)`");
    }
}
else if (process.argv[2] === "clear") {
    clearFixHistory();
}
else {
    throw new Error("Invalid argument: `muloc (show <arguments> | apply <arguments> | clear)`");
}
async function showFix(fileName) {
    if (fileName === undefined) {
        logger.error("Specify file name");
        return;
    }
    await (0, promises_1.readFile)(`${FilePathSetting_1.fixedFileDir}/${fileName}`, "utf-8")
        .then((fixedSource) => {
        logger.log(fixedSource);
    })
        .catch((error) => {
        logger.error(error);
    });
}
async function applyFix(filePath) {
    if (filePath === undefined) {
        logger.error("Specify file path");
        return;
    }
    const fileName = filePath.split("/").slice(-1);
    await (0, promises_1.readFile)(`${FilePathSetting_1.fixedFileDir}/${fileName}`, "utf-8")
        .then(async (fixedSource) => {
        await (0, promises_1.writeFile)(filePath, fixedSource, "utf-8");
    })
        .catch((error) => {
        logger.error(error);
    });
}
async function clearFixHistory() {
    await (0, promises_1.writeFile)(FilePathSetting_1.fixHistoryFile, "", "utf-8").catch(async (error) => {
        await (0, promises_1.mkdir)(FilePathSetting_1.fixedFileDir, { recursive: true });
        await (0, promises_1.writeFile)(FilePathSetting_1.fixHistoryFile, "", "utf-8");
    });
}
async function showOrder() {
    await (0, promises_1.readFile)(FilePathSetting_1.locatorOrderFile, "utf-8")
        .catch(() => {
        logger.error("No locator-order.config file");
        logger.error("Run some tests and execute `muloc order apply`");
    })
        .then((locatorOrder) => {
        if (locatorOrder === "") {
            logger.info("No locator order");
        }
        else {
            logger.info(locatorOrder);
        }
    });
}
async function applyOrder() {
    await (0, LocatorOrder_1.writeLocatorOrder)(FilePathSetting_1.locatorOrderFile);
}
//# sourceMappingURL=Command.js.map