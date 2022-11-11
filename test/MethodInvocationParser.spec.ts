import Rewire from "rewire";

const MethodInvocationParser = Rewire("../src/MethodInvocationParser.ts");

describe("Test CodeFragmentsContainer", () => {
  const CodeFragmentsContainer = MethodInvocationParser.__get__(
    "CodeFragmentsContainer"
  );
  let codeFragmentsContainer: any;

  beforeEach(() => {
    codeFragmentsContainer = new CodeFragmentsContainer();
  });

  it("After registering locator type and value, a locator code fragment is registered", () => {
    codeFragmentsContainer.registerLocatorType({
      locatorType: "id",
      lineNum: 1,
      start: 1,
      end: 5,
    });
    codeFragmentsContainer.registerLocatorValue({
      locatorValue: "value",
      lineNum: 1,
      start: 7,
      end: 12,
    });

    expect(codeFragmentsContainer._locatorCodeFragments.length).toBe(1);
  });

  it("When registering only locator type, locator code fragments are not registered", () => {
    codeFragmentsContainer.registerLocatorType({
      locatorType: "id",
      lineNum: 1,
      start: 1,
      end: 5,
    });

    expect(codeFragmentsContainer._locatorCodeFragments.length).toBe(0);
  });
});

describe("Test CodeFragmentsCollector", () => {
  let codeFragmentsCollector: any;

  beforeEach(() => {
    const CodeFragmentsCollector = MethodInvocationParser.__get__(
      "CodeFragmentsCollector"
    );

    const invocationCode = `
    return driver.findElementMulti(
      { id: "username" },
      { xpath: '//*[@id="username"]' }
    );`;

    // "at" is point at an index where "findElementMulti" begins.
    const invocationInfo = { file: "test_script.js", lineNum: 10, at: 19 };

    codeFragmentsCollector = new CodeFragmentsCollector(
      invocationCode,
      invocationInfo
    );
  });

  it("Parse invoked method and get code fragments of locator, arguments, and method invocation", () => {
    codeFragmentsCollector.parseInvocation();
    const {
      locatorCodeFragments,
      argumentsCodeFragment,
      methodInvocationCodeFragment,
    } = codeFragmentsCollector.codeFragments;
    console.log(codeFragmentsCollector.codeFragments);

    const locatorTypeFragment1 = {
      file: "test_script.js",
      string: "id",
      lineNum: 11,
      start: 9,
      end: 11,
    };

    const locatorValueFragment1 = {
      file: "test_script.js",
      string: `"username"`,
      lineNum: 11,
      start: 13,
      end: 23,
    };

    const locatorTypeFragment2 = {
      file: "test_script.js",
      string: "xpath",
      lineNum: 12,
      start: 9,
      end: 14,
    };

    const locatorValueFragment2 = {
      file: "test_script.js",
      string: `'//*[@id="username"]'`,
      lineNum: 12,
      start: 16,
      end: 37,
    };

    expect(locatorCodeFragments).toEqual([
      { type: locatorTypeFragment1, value: locatorValueFragment1 },
      { type: locatorTypeFragment2, value: locatorValueFragment2 },
    ]);

    const expectedArgumentsCodeFragment = {
      file: "test_script.js",
      string: `{ id: "username" },
      { xpath: '//*[@id="username"]' }
    `,
      lineNum: 11,
      start: 7,
      end: 6,
    };

    expect(argumentsCodeFragment).toEqual(expectedArgumentsCodeFragment);

    const expectedMethodInvocationCodeFragment = {
      file: "test_script.js",
      string: "findElementMulti",
      lineNum: 10,
      start: 19,
      end: 35,
    };

    expect(methodInvocationCodeFragment).toEqual(
      expectedMethodInvocationCodeFragment
    );
  });
});
