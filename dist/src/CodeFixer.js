"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeFixRegister = exports.CodeFixWriter = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const log4js_1 = __importDefault(require("log4js"));
const FilePathSetting_1 = require("./FilePathSetting");
const Types_1 = require("./Types");
const WebDriverUtil_1 = require("./WebDriverUtil");
class Sources {
    static _sources; // file -> source
    constructor() { }
    static get sources() {
        if (!this._sources) {
            this._sources = new Map();
        }
        return this._sources;
    }
    static async forEachAsync(f) {
        for (const [file, source] of this.sources) {
            await f(file, source);
        }
    }
    static get(file) {
        return this.sources.get(file);
    }
    static set(file, source) {
        this.sources.set(file, source);
    }
}
class LocatorFixes {
    static _locatorFixes;
    constructor() { }
    static get locatorFixes() {
        if (this._locatorFixes === undefined) {
            this._locatorFixes = [];
        }
        return this._locatorFixes;
    }
    static push(locatorFix) {
        this.locatorFixes.push(locatorFix);
    }
    static sort(f) {
        this.locatorFixes.sort(f);
    }
    static async forEachAsync(f) {
        for (const locatorFix of this.locatorFixes) {
            await f(locatorFix);
        }
    }
}
class LocatorExtensions {
    static _locatorExtensions;
    constructor() { }
    static get locatorExtensions() {
        if (this._locatorExtensions === undefined) {
            this._locatorExtensions = [];
        }
        return this._locatorExtensions;
    }
    static async forEachAsync(f) {
        for (const locatorExtension of this.locatorExtensions) {
            await f(locatorExtension);
        }
    }
    static push(locatorExtension) {
        this.locatorExtensions.push(locatorExtension);
    }
}
class MethodInvocations {
    static _methodInvocations;
    constructor() { }
    static get methodInvocations() {
        if (this._methodInvocations === undefined) {
            this._methodInvocations = [];
        }
        return this._methodInvocations;
    }
    static push(methodInvocation) {
        this.methodInvocations.push(methodInvocation);
    }
    static async forEachAsync(f) {
        for (const methodInvocation of this.methodInvocations) {
            await f(methodInvocation);
        }
    }
}
class CodeFixWriter {
    recordFix = async () => {
        await this.applyLocatorFix();
        await this.applyLocatorExtension();
        await this.writeFixHistory();
        await this.writeFixedSource();
    };
    getSource = async (file) => Sources.get(file) ?? (await (0, promises_1.readFile)(file, "utf-8"));
    applyLocatorFix = async () => {
        await LocatorFixes.forEachAsync(async (fix) => {
            const file = fix.locatorCodeFragment.type.file;
            const source = await this.getSource(file);
            const lines = source.split("\n");
            const { lineNum, start, end } = fix.locatorCodeFragment.value;
            // correctValue not includes surrounding symbols
            lines[lineNum - 1] =
                lines[lineNum - 1].slice(0, start) +
                    fix.correctValue +
                    lines[lineNum - 1].slice(end - 2);
            Sources.set(file, lines.join("\n"));
        });
    };
    applyLocatorExtension = async () => {
        await LocatorExtensions.forEachAsync(async (extension) => {
            const file = extension.argumentsCodeFragment.file;
            const source = await this.getSource(file);
            const lines = source.split("\n");
            const { lineNum, start, end } = extension.argumentsCodeFragment;
            lines[lineNum - 1] =
                lines[lineNum - 1].slice(0, start - 1) +
                    extension.newArgumentsString +
                    lines[lineNum - 1].slice(end - 1);
            Sources.set(file, lines.join("\n"));
        });
        // Do after methodInvocation fix.
        // If more than one fixes is made on a single line, the fixes must be applied from behind.
        await MethodInvocations.forEachAsync(async ({ file, lineNum, start, end }) => {
            const source = await this.getSource(file);
            const lines = source.split("\n");
            lines[lineNum - 1] =
                lines[lineNum - 1].slice(0, start - 1) +
                    "findElementMulti" +
                    lines[lineNum - 1].slice(end - 1);
            Sources.set(file, lines.join("\n"));
        });
    };
    writeFixHistory = async () => {
        const content = await (0, promises_1.readFile)(FilePathSetting_1.fixHistoryFile, "utf-8")
            .then((content) => {
            if (content === "" || content === undefined) {
                return "[]";
            }
            else {
                return content;
            }
        })
            .catch((e) => {
            return "[]";
        });
        const json = JSON.parse(content);
        await LocatorFixes.forEachAsync((locatorFix) => {
            json.push(locatorFix);
        });
        await (0, promises_1.writeFile)(FilePathSetting_1.fixHistoryFile, JSON.stringify(json), "utf-8");
    };
    writeFixedSource = async () => {
        await Sources.forEachAsync(async (filePath, source) => {
            const logger = log4js_1.default.getLogger();
            logger.debug(`
  file: ${filePath}
  source:`);
            logger.debug(source);
            const fileName = (0, path_1.basename)(filePath);
            await (0, promises_1.mkdir)(FilePathSetting_1.fixedFileDir, { recursive: true });
            await (0, promises_1.writeFile)(`${FilePathSetting_1.fixedFileDir}/${fileName}`, source, "utf-8");
        });
    };
}
exports.CodeFixWriter = CodeFixWriter;
class CodeFixRegister {
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    registerLocatorFix = async (element, brokenLocators, locatorCodeFragments) => {
        for (const brokenLocator of brokenLocators) {
            const maybeCorrectValue = await this.getLocatorValue(element, brokenLocator.type);
            const correctValue = maybeCorrectValue ??
                `cannot generate '${brokenLocator.type}' locator for this element`;
            const locatorCodeFragment = this.getBrokenLocatorCodeFragment(brokenLocator, locatorCodeFragments);
            const locatorFix = {
                locatorCodeFragment,
                correctValue,
                time: Date.now(),
            };
            LocatorFixes.push(locatorFix);
            LocatorFixes.sort(this.compareLocatorFix);
            showLocatorFix(locatorFix);
        }
    };
    /**
     * Sort by value's end position (backward first)
     * If more than one fixes is made on a single line, the fixes must be applied from behind.
     * @param a
     * @param b
     * @returns
     */
    compareLocatorFix = (a, b) => {
        const aValue = a.locatorCodeFragment.value;
        const bValue = b.locatorCodeFragment.value;
        if (aValue.lineNum === bValue.lineNum) {
            return bValue.end - aValue.end;
        }
        else {
            return bValue.lineNum - aValue.lineNum;
        }
    };
    registerLocatorExtension = async (originalLocator, element, argumentsCodeFragment, methodInvocationCodeFragment) => {
        let newArgumentsString = "";
        for (const type of Types_1.TargetLocatorTypes) {
            // not generate partial locator because they do not have a unique value.
            if (["partialInnerText", "partialLinkText"].includes(type)) {
                continue;
            }
            const value = originalLocator.type === type
                ? originalLocator.value
                : await this.getLocatorValue(element, type);
            if (value !== undefined) {
                newArgumentsString += `{ ${type}: "${value.replaceAll('"', "'")}" }, `;
            }
        }
        const locatorExtension = {
            argumentsCodeFragment,
            newArgumentsString: newArgumentsString.slice(0, -2), // remove trailing comma
        };
        LocatorExtensions.push(locatorExtension);
        MethodInvocations.push(methodInvocationCodeFragment);
    };
    getBrokenLocatorCodeFragment = (locator, locatorCodeFragments) => {
        for (const locatorCodeFragment of locatorCodeFragments) {
            if (locatorCodeFragment.type.string === locator.type &&
                locatorCodeFragment.value.string.slice(1, -1) === locator.value // remove enclosing symbol
            ) {
                return locatorCodeFragment;
            }
        }
        throw new Error("fail to get locator code fragment");
    };
    /**
     * Needs improvement as it does not consider uniqueness of elements
     * @param element
     * @param type
     * @returns
     */
    getLocatorValue = async (element, type) => {
        const falsyToUndef = (value) => value === "" || value === null ? undefined : value;
        const locatorValue = await (async () => {
            switch (type) {
                case "xpath":
                    return (0, WebDriverUtil_1.getXpath)(this.driver, element);
                case "id":
                case "name": {
                    const value = await element.getAttribute(type);
                    return falsyToUndef(value);
                }
                case "linkText":
                case "partialLinkText": {
                    const value = await element.getAttribute("text");
                    return falsyToUndef(value);
                }
                case "innerText":
                case "partialInnerText": {
                    const tagname = await element.getTagName();
                    const value = tagname.toLowerCase() === "select" ? "" : await element.getText();
                    return falsyToUndef(value);
                }
                case "css":
                    return (0, WebDriverUtil_1.getCssSelector)(this.driver, element);
                default:
                    const unreachable = type;
                    return unreachable;
            }
        })();
        if (locatorValue === undefined) {
            return;
        }
        if (locatorValue.trim().length === 0) {
            return;
        }
        if (!await (0, WebDriverUtil_1.isUniqueLocator)(this.driver, { type, value: locatorValue })) {
            return;
        }
        return locatorValue;
    };
}
exports.CodeFixRegister = CodeFixRegister;
const showLocatorFix = (locatorFix) => {
    const { locatorCodeFragment, correctValue } = locatorFix;
    log4js_1.default.getLogger().debug(`
broken locator:
  type: ${locatorCodeFragment.type.string}
  value: ${locatorCodeFragment.value.string.slice(1, -1)}
  file: ${locatorCodeFragment.type.file}
  fix line ${locatorCodeFragment.value.lineNum} at ${locatorCodeFragment.value.start}--${locatorCodeFragment.value.end} to "${correctValue}"
`);
};
//# sourceMappingURL=CodeFixer.js.map