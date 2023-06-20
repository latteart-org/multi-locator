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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeFixRegister = exports.CodeFixWriter = void 0;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var log4js_1 = __importDefault(require("log4js"));
var FilePathSetting_1 = require("./FilePathSetting");
var Types_1 = require("./Types");
var WebDriverUtil_1 = require("./WebDriverUtil");
var Sources = /** @class */ (function () {
    function Sources() {
    }
    Object.defineProperty(Sources, "sources", {
        get: function () {
            if (!this._sources) {
                this._sources = new Map();
            }
            return this._sources;
        },
        enumerable: false,
        configurable: true
    });
    Sources.forEachAsync = function (f) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, file, source, e_1_1;
            var e_1, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 5, 6, 7]);
                        _a = __values(this.sources), _b = _a.next();
                        _e.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        _c = __read(_b.value, 2), file = _c[0], source = _c[1];
                        return [4 /*yield*/, f(file, source)];
                    case 2:
                        _e.sent();
                        _e.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Sources.get = function (file) {
        return this.sources.get(file);
    };
    Sources.set = function (file, source) {
        this.sources.set(file, source);
    };
    return Sources;
}());
var LocatorFixes = /** @class */ (function () {
    function LocatorFixes() {
    }
    Object.defineProperty(LocatorFixes, "locatorFixes", {
        get: function () {
            if (this._locatorFixes === undefined) {
                this._locatorFixes = [];
            }
            return this._locatorFixes;
        },
        enumerable: false,
        configurable: true
    });
    LocatorFixes.push = function (locatorFix) {
        this.locatorFixes.push(locatorFix);
    };
    LocatorFixes.sort = function (f) {
        this.locatorFixes.sort(f);
    };
    LocatorFixes.forEachAsync = function (f) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, locatorFix, e_2_1;
            var e_2, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = __values(this.locatorFixes), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        locatorFix = _b.value;
                        return [4 /*yield*/, f(locatorFix)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_2_1 = _d.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return LocatorFixes;
}());
var LocatorExtensions = /** @class */ (function () {
    function LocatorExtensions() {
    }
    Object.defineProperty(LocatorExtensions, "locatorExtensions", {
        get: function () {
            if (this._locatorExtensions === undefined) {
                this._locatorExtensions = [];
            }
            return this._locatorExtensions;
        },
        enumerable: false,
        configurable: true
    });
    LocatorExtensions.forEachAsync = function (f) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, locatorExtension, e_3_1;
            var e_3, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = __values(this.locatorExtensions), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        locatorExtension = _b.value;
                        return [4 /*yield*/, f(locatorExtension)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_3_1 = _d.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    LocatorExtensions.push = function (locatorExtension) {
        this.locatorExtensions.push(locatorExtension);
    };
    return LocatorExtensions;
}());
var MethodInvocations = /** @class */ (function () {
    function MethodInvocations() {
    }
    Object.defineProperty(MethodInvocations, "methodInvocations", {
        get: function () {
            if (this._methodInvocations === undefined) {
                this._methodInvocations = [];
            }
            return this._methodInvocations;
        },
        enumerable: false,
        configurable: true
    });
    MethodInvocations.push = function (methodInvocation) {
        this.methodInvocations.push(methodInvocation);
    };
    MethodInvocations.forEachAsync = function (f) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, methodInvocation, e_4_1;
            var e_4, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = __values(this.methodInvocations), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        methodInvocation = _b.value;
                        return [4 /*yield*/, f(methodInvocation)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_4_1 = _d.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_4) throw e_4.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return MethodInvocations;
}());
var CodeFixWriter = /** @class */ (function () {
    function CodeFixWriter() {
        var _this = this;
        this.recordFix = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.applyLocatorFix()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.applyLocatorExtension()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.writeFixHistory()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.writeFixedSource()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.getSource = function (file) { return __awaiter(_this, void 0, void 0, function () { var _a; var _b; return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!((_b = Sources.get(file)) !== null && _b !== void 0)) return [3 /*break*/, 1];
                    _a = _b;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, (0, promises_1.readFile)(file, "utf-8")];
                case 2:
                    _a = (_c.sent());
                    _c.label = 3;
                case 3: return [2 /*return*/, _a];
            }
        }); }); };
        this.applyLocatorFix = function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, LocatorFixes.forEachAsync(function (fix) { return __awaiter(_this, void 0, void 0, function () {
                            var file, source, lines, _a, lineNum, start, end;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        file = fix.locatorCodeFragment.type.file;
                                        return [4 /*yield*/, this.getSource(file)];
                                    case 1:
                                        source = _b.sent();
                                        lines = source.split("\n");
                                        _a = fix.locatorCodeFragment.value, lineNum = _a.lineNum, start = _a.start, end = _a.end;
                                        // correctValue not includes surrounding symbols
                                        lines[lineNum - 1] =
                                            lines[lineNum - 1].slice(0, start) +
                                                fix.correctValue +
                                                lines[lineNum - 1].slice(end - 2);
                                        Sources.set(file, lines.join("\n"));
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.applyLocatorExtension = function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, LocatorExtensions.forEachAsync(function (extension) { return __awaiter(_this, void 0, void 0, function () {
                            var file, source, lines, _a, lineNum, start, end;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        file = extension.argumentsCodeFragment.file;
                                        return [4 /*yield*/, this.getSource(file)];
                                    case 1:
                                        source = _b.sent();
                                        lines = source.split("\n");
                                        _a = extension.argumentsCodeFragment, lineNum = _a.lineNum, start = _a.start, end = _a.end;
                                        lines[lineNum - 1] =
                                            lines[lineNum - 1].slice(0, start - 1) +
                                                extension.newArgumentsString +
                                                lines[lineNum - 1].slice(end - 1);
                                        Sources.set(file, lines.join("\n"));
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        // Do after methodInvocation fix.
                        // If more than one fixes is made on a single line, the fixes must be applied from behind.
                        return [4 /*yield*/, MethodInvocations.forEachAsync(function (_a) {
                                var file = _a.file, lineNum = _a.lineNum, start = _a.start, end = _a.end;
                                return __awaiter(_this, void 0, void 0, function () {
                                    var source, lines;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0: return [4 /*yield*/, this.getSource(file)];
                                            case 1:
                                                source = _b.sent();
                                                lines = source.split("\n");
                                                lines[lineNum - 1] =
                                                    lines[lineNum - 1].slice(0, start - 1) +
                                                        "findElementMulti" +
                                                        lines[lineNum - 1].slice(end - 1);
                                                Sources.set(file, lines.join("\n"));
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            })];
                    case 2:
                        // Do after methodInvocation fix.
                        // If more than one fixes is made on a single line, the fixes must be applied from behind.
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.writeFixHistory = function () { return __awaiter(_this, void 0, void 0, function () {
            var content, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, promises_1.readFile)(FilePathSetting_1.fixHistoryFile, "utf-8")
                            .then(function (content) {
                            if (content === "" || content === undefined) {
                                return "[]";
                            }
                            else {
                                return content;
                            }
                        })
                            .catch(function (e) {
                            return "[]";
                        })];
                    case 1:
                        content = _a.sent();
                        json = JSON.parse(content);
                        return [4 /*yield*/, LocatorFixes.forEachAsync(function (locatorFix) {
                                json.push(locatorFix);
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, promises_1.writeFile)(FilePathSetting_1.fixHistoryFile, JSON.stringify(json), "utf-8")];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.writeFixedSource = function () { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Sources.forEachAsync(function (filePath, source) { return __awaiter(_this, void 0, void 0, function () {
                            var logger, fileName;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        logger = log4js_1.default.getLogger();
                                        logger.debug("\n  file: ".concat(filePath, "\n  source:"));
                                        logger.debug(source);
                                        fileName = (0, path_1.basename)(filePath);
                                        return [4 /*yield*/, (0, promises_1.mkdir)(FilePathSetting_1.fixedFileDir, { recursive: true })];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, (0, promises_1.writeFile)("".concat(FilePathSetting_1.fixedFileDir, "/").concat(fileName), source, "utf-8")];
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
        }); };
    }
    return CodeFixWriter;
}());
exports.CodeFixWriter = CodeFixWriter;
var CodeFixRegister = /** @class */ (function () {
    function CodeFixRegister(driver) {
        var _this = this;
        this.driver = driver;
        this.registerLocatorFix = function (element, brokenLocators, locatorCodeFragments) { return __awaiter(_this, void 0, void 0, function () {
            var brokenLocators_1, brokenLocators_1_1, brokenLocator, maybeCorrectValue, correctValue, locatorCodeFragment, locatorFix, e_5_1;
            var e_5, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, 6, 7]);
                        brokenLocators_1 = __values(brokenLocators), brokenLocators_1_1 = brokenLocators_1.next();
                        _b.label = 1;
                    case 1:
                        if (!!brokenLocators_1_1.done) return [3 /*break*/, 4];
                        brokenLocator = brokenLocators_1_1.value;
                        return [4 /*yield*/, this.getLocatorValue(element, brokenLocator.type)];
                    case 2:
                        maybeCorrectValue = _b.sent();
                        correctValue = maybeCorrectValue !== null && maybeCorrectValue !== void 0 ? maybeCorrectValue : "cannot generate '".concat(brokenLocator.type, "' locator for this element");
                        locatorCodeFragment = this.getBrokenLocatorCodeFragment(brokenLocator, locatorCodeFragments);
                        locatorFix = {
                            locatorCodeFragment: locatorCodeFragment,
                            correctValue: correctValue,
                            time: Date.now(),
                        };
                        LocatorFixes.push(locatorFix);
                        LocatorFixes.sort(this.compareLocatorFix);
                        showLocatorFix(locatorFix);
                        _b.label = 3;
                    case 3:
                        brokenLocators_1_1 = brokenLocators_1.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_5_1 = _b.sent();
                        e_5 = { error: e_5_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (brokenLocators_1_1 && !brokenLocators_1_1.done && (_a = brokenLocators_1.return)) _a.call(brokenLocators_1);
                        }
                        finally { if (e_5) throw e_5.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Sort by value's end position (backward first)
         * If more than one fixes is made on a single line, the fixes must be applied from behind.
         * @param a
         * @param b
         * @returns
         */
        this.compareLocatorFix = function (a, b) {
            var aValue = a.locatorCodeFragment.value;
            var bValue = b.locatorCodeFragment.value;
            if (aValue.lineNum === bValue.lineNum) {
                return bValue.end - aValue.end;
            }
            else {
                return bValue.lineNum - aValue.lineNum;
            }
        };
        this.registerLocatorExtension = function (element, argumentsCodeFragment, methodInvocationCodeFragment) { return __awaiter(_this, void 0, void 0, function () {
            var newArgumentsString, TargetLocatorTypes_1, TargetLocatorTypes_1_1, type, value, e_6_1, locatorExtension;
            var e_6, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        newArgumentsString = "";
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        TargetLocatorTypes_1 = __values(Types_1.TargetLocatorTypes), TargetLocatorTypes_1_1 = TargetLocatorTypes_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!TargetLocatorTypes_1_1.done) return [3 /*break*/, 5];
                        type = TargetLocatorTypes_1_1.value;
                        // not generate partial locator because they do not have a unique value.
                        if (["partialInnerText", "partialLinkText"].includes(type)) {
                            return [3 /*break*/, 4];
                        }
                        return [4 /*yield*/, this.getLocatorValue(element, type)];
                    case 3:
                        value = _b.sent();
                        if (value !== undefined) {
                            newArgumentsString += "{ ".concat(type, ": \"").concat(value, "\" }, ");
                        }
                        _b.label = 4;
                    case 4:
                        TargetLocatorTypes_1_1 = TargetLocatorTypes_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_6_1 = _b.sent();
                        e_6 = { error: e_6_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (TargetLocatorTypes_1_1 && !TargetLocatorTypes_1_1.done && (_a = TargetLocatorTypes_1.return)) _a.call(TargetLocatorTypes_1);
                        }
                        finally { if (e_6) throw e_6.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        locatorExtension = {
                            argumentsCodeFragment: argumentsCodeFragment,
                            newArgumentsString: newArgumentsString.slice(0, -2), // remove trailing comma
                        };
                        LocatorExtensions.push(locatorExtension);
                        MethodInvocations.push(methodInvocationCodeFragment);
                        return [2 /*return*/];
                }
            });
        }); };
        this.getBrokenLocatorCodeFragment = function (locator, locatorCodeFragments) {
            var e_7, _a;
            try {
                for (var locatorCodeFragments_1 = __values(locatorCodeFragments), locatorCodeFragments_1_1 = locatorCodeFragments_1.next(); !locatorCodeFragments_1_1.done; locatorCodeFragments_1_1 = locatorCodeFragments_1.next()) {
                    var locatorCodeFragment = locatorCodeFragments_1_1.value;
                    if (locatorCodeFragment.type.string === locator.type &&
                        locatorCodeFragment.value.string.slice(1, -1) === locator.value // remove enclosing symbol
                    ) {
                        return locatorCodeFragment;
                    }
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (locatorCodeFragments_1_1 && !locatorCodeFragments_1_1.done && (_a = locatorCodeFragments_1.return)) _a.call(locatorCodeFragments_1);
                }
                finally { if (e_7) throw e_7.error; }
            }
            throw new Error("fail to get locator code fragment");
        };
        /**
         * Needs improvement as it does not consider uniqueness of elements
         * @param element
         * @param type
         * @returns
         */
        this.getLocatorValue = function (element, type) { return __awaiter(_this, void 0, void 0, function () {
            var falsyToUndef, _a, value, value, value, unreachable;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        falsyToUndef = function (value) {
                            return value === "" || value === null ? undefined : value;
                        };
                        _a = type;
                        switch (_a) {
                            case "xpath": return [3 /*break*/, 1];
                            case "id": return [3 /*break*/, 2];
                            case "name": return [3 /*break*/, 2];
                            case "linkText": return [3 /*break*/, 4];
                            case "partialLinkText": return [3 /*break*/, 4];
                            case "innerText": return [3 /*break*/, 6];
                            case "partialInnerText": return [3 /*break*/, 6];
                            case "css": return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 9];
                    case 1: return [2 /*return*/, (0, WebDriverUtil_1.getXpath)(this.driver, element)];
                    case 2: return [4 /*yield*/, element.getAttribute(type)];
                    case 3:
                        value = _b.sent();
                        return [2 /*return*/, falsyToUndef(value)];
                    case 4: return [4 /*yield*/, element.getAttribute("text")];
                    case 5:
                        value = _b.sent();
                        return [2 /*return*/, falsyToUndef(value)];
                    case 6: return [4 /*yield*/, element.getText()];
                    case 7:
                        value = _b.sent();
                        return [2 /*return*/, falsyToUndef(value)];
                    case 8: return [2 /*return*/, (0, WebDriverUtil_1.getCssSelector)(this.driver, element)];
                    case 9:
                        unreachable = type;
                        return [2 /*return*/, unreachable];
                }
            });
        }); };
    }
    return CodeFixRegister;
}());
exports.CodeFixRegister = CodeFixRegister;
var showLocatorFix = function (locatorFix) {
    var locatorCodeFragment = locatorFix.locatorCodeFragment, correctValue = locatorFix.correctValue;
    log4js_1.default.getLogger().debug("\nbroken locator:\n  type: ".concat(locatorCodeFragment.type.string, "\n  value: ").concat(locatorCodeFragment.value.string.slice(1, -1), "\n  file: ").concat(locatorCodeFragment.type.file, "\n  fix line ").concat(locatorCodeFragment.value.lineNum, " at ").concat(locatorCodeFragment.value.start, "--").concat(locatorCodeFragment.value.end, " to \"").concat(correctValue, "\"\n"));
};
//# sourceMappingURL=CodeFixer.js.map