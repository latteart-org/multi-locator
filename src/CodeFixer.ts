import { mkdir, readFile, writeFile } from "fs/promises";
import {
  fixedFileDir,
  fixHistoryFile,
  calculateLocatorOrder,
  locatorOrderFile,
} from "./FixHistory";
import { CodeFragment, LocatorCodeFragment } from "./MethodInvocationParser";
import {
  GetElementByDriver,
  TargetDriver,
  TargetLocator,
  TargetLocatorTypes,
} from "./Types";
import { getCssSelector, getXpath } from "./WebDriverUtil";

export type LocatorFix = {
  locatorCodeFragment: LocatorCodeFragment;
  correctValue: string;
  time: number;
};

type LocatorExtension = {
  argumentsCodeFragment: CodeFragment;
  newArgumentsString: string;
};

export class CodeFixer {
  private readonly _locatorFixes: LocatorFix[] = [];
  private readonly _locatorExtensions: LocatorExtension[] = [];
  private readonly _methodInvocations: CodeFragment[] = [];
  private readonly _sources: Map<string, string> = new Map(); // file -> source

  public recordFix = async (): Promise<void> => {
    await this.applyLocatorFix();
    await this.applyLocatorExtension();
    await this.writeFixHistory();
    await this.writeLocatorOrder();
    this._sources.forEach(async (source, path) => {
      console.log(`
  file: ${path}
  source:`);
      console.log(source);
      const fileName = path.split("/").slice(-1);
      await mkdir(fixedFileDir, { recursive: true });
      await writeFile(`${fixedFileDir}/${fileName}`, source, "utf-8");
    });
  };

  public registerLocatorFix = async <T extends TargetDriver>(
    driver: T,
    element: GetElementByDriver<T>,
    brokenLocators: TargetLocator[],
    locatorCodeFragments: LocatorCodeFragment[]
  ) => {
    for (const brokenLocator of brokenLocators) {
      const maybeCorrectValue = await getLocatorValue(
        driver,
        element,
        brokenLocator.type
      );

      const correctValue =
        maybeCorrectValue === null
          ? `no '${brokenLocator.type}' in this element`
          : maybeCorrectValue;

      const locatorCodeFragment = this.getBrokenLocatorCodeFragment(
        brokenLocator,
        locatorCodeFragments
      );
      const locatorFix: LocatorFix = {
        locatorCodeFragment,
        correctValue,
        time: Date.now(),
      };
      this._locatorFixes.push(locatorFix);
      this._locatorFixes.sort(this.compareLocatorFix);
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

  public registerLocatorExtension = async <T extends TargetDriver>(
    driver: T,
    element: GetElementByDriver<T>,
    argumentsCodeFragment: CodeFragment,
    methodInvocationCodeFragment: CodeFragment
  ) => {
    let newArgumentsString = "";
    for (const type of TargetLocatorTypes) {
      const value = await getLocatorValue(driver, element, type);
      if (value !== null) {
        newArgumentsString += `{ ${type}: "${value}" }, `;
      }
    }
    const locatorExtension = {
      argumentsCodeFragment,
      newArgumentsString: newArgumentsString.slice(0, -2), // remove trailing comma
    };
    this._locatorExtensions.push(locatorExtension);
    this._methodInvocations.push(methodInvocationCodeFragment);
  };

  private applyLocatorFix = async () => {
    for (const fix of this._locatorFixes) {
      const file = fix.locatorCodeFragment.type.file;
      const maybeSource = this._sources.get(file);
      const source: string =
        maybeSource === undefined ? await readFile(file, "utf-8") : maybeSource;
      const lines = source.split("\n");
      const { lineNum, start, end } = fix.locatorCodeFragment.value;
      // correctValue not includes surrounding symbols
      lines[lineNum - 1] =
        lines[lineNum - 1].slice(0, start) +
        fix.correctValue +
        lines[lineNum - 1].slice(end - 2);
      this._sources.set(file, lines.join("\n"));
    }
  };

  private applyLocatorExtension = async () => {
    for (const extension of this._locatorExtensions) {
      const file = extension.argumentsCodeFragment.file;
      const maybeSource = this._sources.get(file);
      const source: string =
        maybeSource === undefined ? await readFile(file, "utf-8") : maybeSource;
      const lines = source.split("\n");
      const { lineNum, start, end } = extension.argumentsCodeFragment;
      lines[lineNum - 1] =
        lines[lineNum - 1].slice(0, start - 1) +
        extension.newArgumentsString +
        lines[lineNum - 1].slice(end - 1);
      this._sources.set(file, lines.join("\n"));
    }
    // Do after methodInvocation fix.
    // If more than one fixes is made on a single line, the fixes must be applied from behind.
    for (const { file, lineNum, start, end } of this._methodInvocations) {
      const maybeSource = this._sources.get(file);
      const source: string =
        maybeSource === undefined ? await readFile(file, "utf-8") : maybeSource;
      const lines = source.split("\n");
      lines[lineNum - 1] =
        lines[lineNum - 1].slice(0, start - 1) +
        "findElementMulti" +
        lines[lineNum - 1].slice(end - 1);
      this._sources.set(file, lines.join("\n"));
    }
  };

  private writeFixHistory = async () => {
    const content = await readFile(fixHistoryFile, "utf-8").catch((e) => {
      return "[]";
    });
    const json = JSON.parse(content);
    this._locatorFixes.forEach((locatorFix: LocatorFix) => {
      json.push(locatorFix);
    });
    await writeFile(fixHistoryFile, JSON.stringify(json), "utf-8");
  };

  private writeLocatorOrder = async () => {
    const locatorOrder = await calculateLocatorOrder();
    const list = locatorOrder.join("\n");
    await writeFile(locatorOrderFile, list, "utf-8");
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
}

const showLocatorFix = (locatorFix: LocatorFix) => {
  const { locatorCodeFragment, correctValue } = locatorFix;
  console.log(`
broken locator:
  type: ${locatorCodeFragment.type.string}
  value: ${locatorCodeFragment.value.string.slice(1, -1)}
  file: ${locatorCodeFragment.type.file}
  fix line ${locatorCodeFragment.value.lineNum} at ${
    locatorCodeFragment.value.start
  }--${locatorCodeFragment.value.end} to "${correctValue}"
`);
};

const getLocatorValue = async <T extends TargetDriver>(
  driver: T,
  element: GetElementByDriver<T>,
  type: TargetLocator["type"]
): Promise<string | null> => {
  switch (type) {
    case "xpath":
      return getXpath(driver, element);
    case "id":
    case "name": {
      const value = await element.getAttribute(type);
      return value === "" ? null : value;
    }
    case "linkText":
    case "partialLinkText": {
      const value = await element.getAttribute("text");
      return value === "" ? null : value;
    }
    case "innerText":
    case "partialInnerText": {
      const value = await element.getText();
      return value === "" ? null : value;
    }
    case "css":
      return getCssSelector(driver, element);
    default:
      const unreachable: never = type;
      return unreachable;
  }
};
