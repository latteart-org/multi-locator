import { mkdir, readFile, writeFile } from "fs/promises";
import { basename } from "path";
import Log4js from "log4js";
import { fixedFileDir, fixHistoryFile } from "./FilePathSetting";
import { CodeFragment, LocatorCodeFragment } from "./MethodInvocationParser";
import {
  GetAwaitedElementByDriver,
  GetElementByDriver,
  TargetDriver,
  TargetLocator,
  TargetLocatorTypes,
} from "./Types";
import { isUniqueLocator, getCssSelector, getXpath } from "./WebDriverUtil";

export type LocatorFix = {
  locatorCodeFragment: LocatorCodeFragment;
  correctValue: string;
  time: number;
};

export type LocatorExtension = {
  argumentsCodeFragment: CodeFragment;
  newArgumentsString: string;
};

class Sources {
  private static _sources: Map<string, string>; // file -> source
  private constructor() {}

  private static get sources() {
    if (!this._sources) {
      this._sources = new Map();
    }
    return this._sources;
  }

  public static async forEachAsync(f: (file: string, source: string) => void) {
    for (const [file, source] of this.sources) {
      await f(file, source);
    }
  }

  public static get(file: string): string | undefined {
    return this.sources.get(file);
  }

  public static set(file: string, source: string) {
    this.sources.set(file, source);
  }
}

class LocatorFixes {
  private static _locatorFixes: LocatorFix[];
  private constructor() {}

  private static get locatorFixes() {
    if (this._locatorFixes === undefined) {
      this._locatorFixes = [];
    }
    return this._locatorFixes;
  }

  public static push(locatorFix: LocatorFix) {
    this.locatorFixes.push(locatorFix);
  }

  public static sort(f: (a: LocatorFix, b: LocatorFix) => number) {
    this.locatorFixes.sort(f);
  }

  public static async forEachAsync(f: (locatorFix: LocatorFix) => void) {
    for (const locatorFix of this.locatorFixes) {
      await f(locatorFix);
    }
  }
}

class LocatorExtensions {
  private static _locatorExtensions: LocatorExtension[];
  private constructor() {}

  private static get locatorExtensions() {
    if (this._locatorExtensions === undefined) {
      this._locatorExtensions = [];
    }
    return this._locatorExtensions;
  }

  public static async forEachAsync(
    f: (locatorExtension: LocatorExtension) => void
  ) {
    for (const locatorExtension of this.locatorExtensions) {
      await f(locatorExtension);
    }
  }

  public static push(locatorExtension: LocatorExtension) {
    this.locatorExtensions.push(locatorExtension);
  }
}

class MethodInvocations {
  private static _methodInvocations: CodeFragment[];
  private constructor() {}

  private static get methodInvocations() {
    if (this._methodInvocations === undefined) {
      this._methodInvocations = [];
    }
    return this._methodInvocations;
  }

  public static push(methodInvocation: CodeFragment) {
    this.methodInvocations.push(methodInvocation);
  }

  public static async forEachAsync(
    f: (methodInvocation: CodeFragment) => void
  ) {
    for (const methodInvocation of this.methodInvocations) {
      await f(methodInvocation);
    }
  }
}

export class CodeFixWriter {
  public recordFix = async (): Promise<void> => {
    await this.applyLocatorFix();
    await this.applyLocatorExtension();
    await this.writeFixHistory();
    await this.writeFixedSource();
  };

  private getSource = async (file: string) =>
    Sources.get(file) ?? (await readFile(file, "utf-8"));

  private applyLocatorFix = async () => {
    await LocatorFixes.forEachAsync(async (fix) => {
      const file = fix.locatorCodeFragment.type.file;
      const source: string = await this.getSource(file);
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

  private applyLocatorExtension = async () => {
    await LocatorExtensions.forEachAsync(async (extension) => {
      const file = extension.argumentsCodeFragment.file;
      const source: string = await this.getSource(file);
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
    await MethodInvocations.forEachAsync(
      async ({ file, lineNum, start, end }) => {
        const source: string = await this.getSource(file);
        const lines = source.split("\n");
        lines[lineNum - 1] =
          lines[lineNum - 1].slice(0, start - 1) +
          "findElementMulti" +
          lines[lineNum - 1].slice(end - 1);
        Sources.set(file, lines.join("\n"));
      }
    );
  };

  private writeFixHistory = async () => {
    const content = await readFile(fixHistoryFile, "utf-8")
      .then((content) => {
        if (content === "" || content === undefined) {
          return "[]";
        } else {
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
    await writeFile(fixHistoryFile, JSON.stringify(json), "utf-8");
  };

  private writeFixedSource = async () => {
    await Sources.forEachAsync(async (filePath, source) => {
      const logger = Log4js.getLogger();
      logger.debug(`
  file: ${filePath}
  source:`);
      logger.debug(source);
      const fileName = basename(filePath);
      await mkdir(fixedFileDir, { recursive: true });
      await writeFile(`${fixedFileDir}/${fileName}`, source, "utf-8");
    });
  };
}

export class CodeFixRegister<T extends TargetDriver> {
  constructor(private readonly driver: T) {}

  public registerLocatorFix = async (
    element: GetAwaitedElementByDriver<T>,
    brokenLocators: TargetLocator[],
    locatorCodeFragments: LocatorCodeFragment[]
  ) => {
    for (const brokenLocator of brokenLocators) {
      const maybeCorrectValue = await this.getLocatorValue(
        element,
        brokenLocator.type
      );

      const correctValue =
        maybeCorrectValue ??
        `cannot generate '${brokenLocator.type}' locator for this element`;

      const locatorCodeFragment = this.getBrokenLocatorCodeFragment(
        brokenLocator,
        locatorCodeFragments
      );

      const locatorFix: LocatorFix = {
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
  private compareLocatorFix = (a: LocatorFix, b: LocatorFix) => {
    const aValue = a.locatorCodeFragment.value;
    const bValue = b.locatorCodeFragment.value;
    if (aValue.lineNum === bValue.lineNum) {
      return bValue.end - aValue.end;
    } else {
      return bValue.lineNum - aValue.lineNum;
    }
  };

  public registerLocatorExtension = async (
    originalLocator: TargetLocator,
    element: GetElementByDriver<T>,
    argumentsCodeFragment: CodeFragment,
    methodInvocationCodeFragment: CodeFragment,
  ) => {
    let newArgumentsString = "";
    for (const type of TargetLocatorTypes) {
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

  private getBrokenLocatorCodeFragment = (
    locator: TargetLocator,
    locatorCodeFragments: LocatorCodeFragment[]
  ): LocatorCodeFragment => {
    for (const locatorCodeFragment of locatorCodeFragments) {
      if (
        locatorCodeFragment.type.string === locator.type &&
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
  private getLocatorValue = async (
    element: GetElementByDriver<T>,
    type: TargetLocator["type"]
  ): Promise<string | undefined> => {
    const falsyToUndef = (value: string) =>
      value === "" || value === null ? undefined : value;

    const locatorValue = await (async () => {
      switch (type) {
        case "xpath":
          return getXpath(this.driver, element);
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
          return getCssSelector(this.driver, element);
        default:
          const unreachable: never = type;
          return unreachable;
      }
    })();

    if (locatorValue === undefined) {
      return;
    }

    if (!await isUniqueLocator(this.driver, { type, value: locatorValue })) {
      return;
    }

    return locatorValue;
  };
}

const showLocatorFix = (locatorFix: LocatorFix) => {
  const { locatorCodeFragment, correctValue } = locatorFix;
  Log4js.getLogger().debug(`
broken locator:
  type: ${locatorCodeFragment.type.string}
  value: ${locatorCodeFragment.value.string.slice(1, -1)}
  file: ${locatorCodeFragment.type.file}
  fix line ${locatorCodeFragment.value.lineNum} at ${
    locatorCodeFragment.value.start
  }--${locatorCodeFragment.value.end} to "${correctValue}"
`);
};
