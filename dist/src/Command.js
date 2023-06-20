#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var promises_1 = require("fs/promises");
var log4js_1 = __importDefault(require("log4js"));
var FilePathSetting_1 = require("./FilePathSetting");
var LocatorOrder_1 = require("./LocatorOrder");
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
var logger = log4js_1.default.getLogger();
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
function showFix(fileName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (fileName === undefined) {
                        logger.error("Specify file name");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, promises_1.readFile)("".concat(FilePathSetting_1.fixedFileDir, "/").concat(fileName), "utf-8")
                            .then(function (fixedSource) {
                            logger.log(fixedSource);
                        })
                            .catch(function (error) {
                            logger.error(error);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function applyFix(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var fileName;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (filePath === undefined) {
                        logger.error("Specify file path");
                        return [2 /*return*/];
                    }
                    fileName = filePath.split("/").slice(-1);
                    return [4 /*yield*/, (0, promises_1.readFile)("".concat(FilePathSetting_1.fixedFileDir, "/").concat(fileName), "utf-8")
                            .then(function (fixedSource) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, promises_1.writeFile)(filePath, fixedSource, "utf-8")];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .catch(function (error) {
                            logger.error(error);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function clearFixHistory() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, promises_1.writeFile)(FilePathSetting_1.fixHistoryFile, "", "utf-8").catch(function (error) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, promises_1.mkdir)(FilePathSetting_1.fixedFileDir, { recursive: true })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, (0, promises_1.writeFile)(FilePathSetting_1.fixHistoryFile, "", "utf-8")];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function showOrder() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, promises_1.readFile)(FilePathSetting_1.locatorOrderFile, "utf-8")
                        .catch(function () {
                        logger.error("No locator-order.config file");
                        logger.error("Run some tests and execute `muloc order apply`");
                    })
                        .then(function (locatorOrder) {
                        if (locatorOrder === "") {
                            logger.info("No locator order");
                        }
                        else {
                            logger.info(locatorOrder);
                        }
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function applyOrder() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, LocatorOrder_1.writeLocatorOrder)(FilePathSetting_1.locatorOrderFile)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=Command.js.map