export type InvocationInfo = { file: string; lineNum: number; at: number };

export const parse = (
  invocationCode: string,
  invocationInfo: InvocationInfo
) => {
  const collector = new CodeFragmentCollector(invocationCode, invocationInfo);
  collector.parseInvocation();
  return collector.locatorCodeFragments;
};

export type LocatorCodeFragment = {
  file: string;
  type: CodeFragment;
  value: CodeFragment; // includes surrounding symbols
};

// don't insert line breaks in strings of locator type or value
type CodeFragment = {
  string: string;
  lineNum: number;
  start: number;
  end: number;
};

/**
 * contains locator code fragments for one method invocation
 */
class CodeFragmentCollector {
  /**
   * current index for "target" string
   */
  private _index: number;
  private _lineNum: number;
  /**
   * current index in this line
   */
  private _at: number;
  private _locatorCodeFragmentsContainer: LocatorCodeFragmentsContainer;

  constructor(private _target: string, invocationInfo: InvocationInfo) {
    this._index = invocationInfo.at;
    this._lineNum = invocationInfo.lineNum;
    this._at = invocationInfo.at;
    this._locatorCodeFragmentsContainer = new LocatorCodeFragmentsContainer(
      invocationInfo.file
    );
  }

  get locatorCodeFragments(): LocatorCodeFragment[] {
    return this._locatorCodeFragmentsContainer.get();
  }

  /**
   * ignore white spaces
   * Suppose that there is no comment out
   * @example
   * <invocation> ::= 'findElementMulti' <argument>
   * <argument> ::= '(' <locators> ')'
   * <locators> ::= <locator> (,<locator>)+
   * <locator> ::= '{' <locator type> : <symbol><locator value><symbol> '}'
   * <symbol> ::= ' | " | `
   */
  public parseInvocation = () => {
    while (this.currentChar() !== "(") {
      this.nextSkipWhiteSpace();
    }
    this.parseArgument();
  };

  private next = () => {
    if (this.currentChar() === "\n") {
      this._index++;
      this._lineNum++;
      this._at = 1;
    } else {
      this._index++;
      this._at++;
    }
  };

  private nextSkipWhiteSpace = () => {
    do {
      this.next();
    } while (/\s/.test(this.currentChar()));
  };

  private currentChar = (): string => {
    return this._target[this._index];
  };

  private parseArgument = () => {
    if (this.currentChar() !== "(") {
      throw new Error("argument parse error");
    }
    this.nextSkipWhiteSpace();
    this.parseLocators();
  };

  private parseLocators = () => {
    this.parseLocator();
    while (this.currentChar() !== ")") {
      this.nextSkipWhiteSpace();
      // considering trailing comma
      if (this.currentChar() === ")") {
        break;
      }
      this.parseLocator();
    }
  };

  private parseLocator = () => {
    if (this.currentChar() !== "{") {
      throw new Error("locator parse error");
    }
    this.parseLocatorType();
    if (this.currentChar() !== ":") {
      throw new Error("locator parse error");
    }
    this.nextSkipWhiteSpace();
    this.parseLocatorValue();
    if (this.currentChar() !== "}") {
      throw new Error("locator parse error");
    }
    this.nextSkipWhiteSpace();
  };

  private parseLocatorType = () => {
    this.nextSkipWhiteSpace();
    const start = this._index;
    const startAt = this._at;
    // considering inserted space before ":"
    while (this.currentChar() !== ":" && !/\s/.test(this.currentChar())) {
      this.next();
    }
    const end = this._index;
    const endAt = this._at;
    while (this.currentChar() !== ":") {
      this.nextSkipWhiteSpace();
    }
    const locatorType = this._target.substring(start, end);
    this._locatorCodeFragmentsContainer.pushLocatorType(
      locatorType,
      this._lineNum,
      startAt,
      endAt
    );
  };

  private readonly surroundingSymbols = ["'", '"', "`"];

  private parseLocatorValue = () => {
    while (!this.surroundingSymbols.includes(this.currentChar())) {
      this.nextSkipWhiteSpace();
    }
    const surroundingSymbol = this.currentChar();
    const start = this._index;
    const startAt = this._at;
    this.nextSkipWhiteSpace();
    while (this.currentChar() !== surroundingSymbol) {
      this.nextSkipWhiteSpace();
    }
    const end = this._index + 1;
    const endAt = this._at + 1;
    const locatorValue = this._target.substring(start, end);
    this._locatorCodeFragmentsContainer.pushLocatorValue(
      locatorValue,
      this._lineNum,
      startAt,
      endAt
    );
    while (this.currentChar() !== "}") {
      this.nextSkipWhiteSpace();
    }
  };
}

class LocatorCodeFragmentsContainer {
  private locatorCodeFragments: LocatorCodeFragment[] = [];
  private tmpLocatorTypeCodeFragment: CodeFragment | undefined = undefined;

  constructor(private file: string) {}

  public get = () => {
    return this.locatorCodeFragments;
  };

  public pushLocatorType = (
    locatorType: string,
    lineNum: number,
    start: number,
    end: number
  ) => {
    this.tmpLocatorTypeCodeFragment = {
      string: locatorType,
      lineNum,
      start,
      end,
    };
  };

  public pushLocatorValue = (
    locatorValue: string,
    lineNum: number,
    start: number,
    end: number
  ) => {
    if (this.tmpLocatorTypeCodeFragment === undefined) {
      throw new Error("temporary locator type is undefined");
    }
    const locatorValueCodeFragment: CodeFragment = {
      string: locatorValue,
      lineNum,
      start,
      end,
    };
    const locatorCodeFragment: LocatorCodeFragment = {
      file: this.file,
      type: this.tmpLocatorTypeCodeFragment,
      value: locatorValueCodeFragment,
    };
    this.locatorCodeFragments.push(locatorCodeFragment);
  };
}
