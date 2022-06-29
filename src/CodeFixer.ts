import { mkdir, readFile, writeFile } from "fs/promises";
import { fixedFileDir, fixHistoryFile, getLocatorOrder } from "./FixHistory";
import { LocatorCodeFragment } from "./MethodInvocationParser";
import { GetElementByDriver, TargetDriver, TargetLocator } from "./Types";
import { getCssSelector, getXpath } from "./WebDriverUtil";

export type LocatorFix = {
  locatorCodeFragment: LocatorCodeFragment;
  brokenLocator: TargetLocator;
  correctValue: string;
  time: number;
};

export class CodeFixer {
  private readonly _locatorFixes: LocatorFix[] = [];

  public recordFix = async (): Promise<void> => {
    const sources = await this.getFixedSource();
    await this.writeFixHistory();
    sources.forEach(async (source, path) => {
      console.log(`
  file: ${path}
  source:`);
      console.log(source);
      const fileName = path.split("/").slice(-1);
      await mkdir(fixedFileDir, { recursive: true });
      await writeFile(`${fixedFileDir}/${fileName}`, source, "utf-8");
    });
  };

  public registerFix = async <T extends TargetDriver>(
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
        brokenLocator,
        correctValue,
        time: Date.now(),
      };
      this._locatorFixes.push(locatorFix);
      showLocatorFix(locatorFix);
    }
  };

  private getFixedSource = async () => {
    const sources: Map<string, string> = new Map(); // file -> source
    for (const fix of this._locatorFixes) {
      const file = fix.locatorCodeFragment.file;
      const maybeSource = sources.get(file);
      const source: string =
        maybeSource === undefined ? await readFile(file, "utf-8") : maybeSource;
      const lines = source.split("\n");
      const { lineNum, start, end } = fix.locatorCodeFragment.value;
      lines[lineNum - 1] =
        lines[lineNum - 1].slice(0, start) +
        fix.correctValue +
        lines[lineNum - 1].slice(end - 2);
      sources.set(file, lines.join("\n"));
    }
    return sources;
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
  const { brokenLocator, locatorCodeFragment, correctValue } = locatorFix;
  console.log(`
broken locator:
  type: ${brokenLocator.type}
  value: ${brokenLocator.value}
  file: ${locatorCodeFragment.file}
  fix line ${locatorCodeFragment.value.lineNum} at ${locatorCodeFragment.value.start}--${locatorCodeFragment.value.end} to "${correctValue}"
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
    case "name":
      return element.getAttribute(type);
    case "linkText":
    case "partialLinkText":
      return element.getAttribute("text");
    case "innerText":
    case "partialInnerText":
      return element.getText();
    case "css":
      return getCssSelector(driver, element);
    default:
      const unreachable: never = type;
      return unreachable;
  }
};
