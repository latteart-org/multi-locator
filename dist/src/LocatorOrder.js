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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeLocatorOrder = exports.readLocatorOrder = void 0;
var promises_1 = require("fs/promises");
var FilePathSetting_1 = require("./FilePathSetting");
var getFixHistory = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, promises_1.readFile)(FilePathSetting_1.fixHistoryFile, "utf-8")
                    .then(function (data) {
                    if (data === undefined || data === "") {
                        return undefined;
                    }
                    return JSON.parse(data);
                })
                    .catch(function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, (0, promises_1.mkdir)(FilePathSetting_1.fixedFileDir, { recursive: true })];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, (0, promises_1.writeFile)(FilePathSetting_1.fixHistoryFile, "", "utf-8")];
                            case 2:
                                _a.sent();
                                return [2 /*return*/, undefined];
                        }
                    });
                }); })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var getBreakageCount = function () { return __awaiter(void 0, void 0, void 0, function () {
    var fixHistory;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getFixHistory()];
            case 1:
                fixHistory = _a.sent();
                if (fixHistory === undefined) {
                    return [2 /*return*/, undefined];
                }
                return [2 /*return*/, fixHistory.reduce(function (breakageCount, cur) {
                        var count = breakageCount.get(cur.locatorCodeFragment.type.string);
                        if (count === undefined) {
                            breakageCount.set(cur.locatorCodeFragment.type.string, 1);
                        }
                        else {
                            breakageCount.set(cur.locatorCodeFragment.type.string, count + 1);
                        }
                        return breakageCount;
                    }, new Map())];
        }
    });
}); };
var calculateLocatorOrder = function () { return __awaiter(void 0, void 0, void 0, function () {
    var breakageCount, locatorOrder;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getBreakageCount()];
            case 1:
                breakageCount = _a.sent();
                if (breakageCount === undefined) {
                    return [2 /*return*/, []];
                }
                locatorOrder = Array.from(breakageCount)
                    .sort(function (a, b) { return a[1] - b[1]; })
                    .map(function (_a) {
                    var _b = __read(_a, 2), value = _b[0], _ = _b[1];
                    return value;
                });
                return [2 /*return*/, locatorOrder];
        }
    });
}); };
var readLocatorOrder = function (locatorOrderFile) { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, promises_1.readFile)(locatorOrderFile, "utf-8").catch(function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, (0, promises_1.mkdir)(FilePathSetting_1.fixedFileDir, { recursive: true })];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, (0, promises_1.writeFile)(locatorOrderFile, "", "utf-8")];
                            case 2:
                                _a.sent();
                                return [2 /*return*/, ""];
                        }
                    });
                }); })];
            case 1:
                data = _a.sent();
                return [2 /*return*/, data.split("\n").reduce(function (map, type, order) {
                        return map.set(type, order);
                    }, new Map())];
        }
    });
}); };
exports.readLocatorOrder = readLocatorOrder;
var writeLocatorOrder = function (locatorOrderFile) { return __awaiter(void 0, void 0, void 0, function () {
    var locatorOrder, list;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, calculateLocatorOrder()];
            case 1:
                locatorOrder = _a.sent();
                list = locatorOrder.join("\n");
                return [4 /*yield*/, (0, promises_1.mkdir)(FilePathSetting_1.fixedFileDir, { recursive: true })];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, promises_1.writeFile)(locatorOrderFile, list, "utf-8")];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.writeLocatorOrder = writeLocatorOrder;
//# sourceMappingURL=LocatorOrder.js.map