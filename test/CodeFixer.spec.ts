import { CodeFixer } from "../src/CodeFixer";
import { SeleniumDriver, SeleniumElement, TargetLocator } from "../src/Types";
import Rewire from "rewire";

let driver: any;
// let rewiredCodeFixer: any;

describe("Test CodeFixer", () => {
  beforeEach(async () => {
    // rewiredCodeFixer = Rewire("../src/CodeFixer.ts").__get__("CodeFixer");
    // driver = await new Builder().forBrowser("chrome").build();
  });

  it("register fix for broken locator (id=username_broken)", async () => {
    const codeFixer = new CodeFixer<SeleniumDriver>(driver);
    const elementMock = {} as Awaited<Promise<SeleniumElement>>;
    const getLocatorValueMock = jest.spyOn(codeFixer as any, "getLocatorValue");
    getLocatorValueMock.mockImplementation((element, type) => "username");

    const brokenLocators: TargetLocator[] = [
      { type: "id", value: "username_broken" },
    ];
    const locatorTypeFragment = {
      file: "test_script.js",
      string: "id",
      lineNum: 11,
      start: 9,
      end: 11,
    };
    const locatorValueFragment = {
      file: "test_script.js",
      string: `"username_broken"`,
      lineNum: 11,
      start: 13,
      end: 23,
    };
    const locatorCodeFragments = [
      {
        type: locatorTypeFragment,
        value: locatorValueFragment,
      },
    ];
    await codeFixer.registerLocatorFix(
      elementMock,
      brokenLocators,
      locatorCodeFragments
    );

    const locatorFixes = codeFixer["_locatorFixes"];

    expect(locatorFixes.length).toBe(1);
    expect(locatorFixes[0].correctValue).toBe("username");
    expect(locatorFixes[0].locatorCodeFragment.type).toEqual(
      locatorTypeFragment
    );
    expect(locatorFixes[0].locatorCodeFragment.value).toEqual(
      locatorValueFragment
    );
  });

  it("register locator extension (add xpath locator)", async () => {
    const codeFixer = new CodeFixer<SeleniumDriver>(driver);
    const elementMock = {} as Awaited<Promise<SeleniumElement>>;
    const getLocatorValueMock = jest.spyOn(codeFixer as any, "getLocatorValue");
    getLocatorValueMock.mockImplementation((_, type) => {
      switch (type) {
        case "id":
          return "username";
        case "xpath":
          return "//HTML/BODY/DIV";
      }
    });
    const argumentsCodeFragment = {
      file: "test_script.js",
      string: `{ id: "username" }`,
      lineNum: 11,
      start: 7,
      end: 25,
    };
    const methodInvocationCodeFragment = {
      file: "test_script.js",
      string: "findElement",
      lineNum: 10,
      start: 19,
      end: 35,
    };
    await codeFixer.registerLocatorExtension(
      elementMock,
      argumentsCodeFragment,
      methodInvocationCodeFragment
    );

    const actualLocatorExtensions = codeFixer["_locatorExtensions"];

    const newArgumentsString = `{ id: "username" }, { xpath: "//HTML/BODY/DIV" }`;
    const expectedLocatorExtensions = [
      { argumentsCodeFragment, newArgumentsString },
    ];

    expect(actualLocatorExtensions).toEqual(expectedLocatorExtensions);
  });
});
