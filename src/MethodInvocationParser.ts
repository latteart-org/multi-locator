export type InvocationInfo = { file: string; lineNum: number; at: number };

export const parse = (
  invocationCode: string,
  invocationInfo: InvocationInfo
): ParsedCodeFragments => {
  const collector = new CodeFragmentsCollector(invocationCode, invocationInfo);
  collector.parseInvocation();
  return collector.codeFragments;
};

export type ParsedCodeFragments = {
  methodInvocationCodeFragment: CodeFragment;
  argumentsCodeFragment: CodeFragment; // suppose single line
  locatorCodeFragments: LocatorCodeFragment[];
};

export type LocatorCodeFragment = {
  type: CodeFragment;
  value: CodeFragment; // includes surrounding symbols
};

// don't insert line breaks in strings of locator type or value
export type CodeFragment = {
  file: string;
  string: string;
  lineNum: number;
  start: number;
  end: number;
};

/**
 * contains locator code fragments for one method invocation
 */
class CodeFragmentsCollector {
  /**
   * current index for "target" string
   */
  private _index: number;
  private _lineNum: number;
  /**
   * current index in this line
   */
  private _at: number;
  private _codeFragmentsContainer: CodeFragmentsContainer;

  constructor(private _invocationCode: string, invocationInfo: InvocationInfo) {
    this._index = invocationInfo.at;
    this._lineNum = invocationInfo.lineNum;
    this._at = invocationInfo.at;
    this._codeFragmentsContainer = new CodeFragmentsContainer(
      invocationInfo.file
    );
  }

  get codeFragments(): ParsedCodeFragments {
    return {
      locatorCodeFragments: this._codeFragmentsContainer.locatorCodeFragments,
      argumentsCodeFragment: this._codeFragmentsContainer.argumentsCodeFragment,
      methodInvocationCodeFragment:
        this._codeFragmentsContainer.methodInvocationCodeFragment,
    };
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
    const start = this._index;
    const startAt = this._at;
    while (this.currentChar() !== "(") {
      this.nextSkipWhiteSpace();
    }
    const end = this._index;
    const endAt = this._at + 1;
    const methodName = this._invocationCode.substring(start - 1, end);
    this._codeFragmentsContainer.registerMethodInvocation(
      methodName,
      this._lineNum,
      startAt,
      endAt
    );
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
    return this._invocationCode[this._index];
  };

  private parseArgument = () => {
    if (this.currentChar() !== "(") {
      throw new Error("argument parse error");
    }
    this.nextSkipWhiteSpace();
    const start = this._index;
    const startAt = this._at;
    const lineNum = this._lineNum;
    this.parseLocators();
    const end = this._index;
    const endAt = this._at;
    const argumentsString = this._invocationCode.substring(start, end);
    this._codeFragmentsContainer.registerArguments(
      argumentsString,
      lineNum,
      startAt,
      endAt
    );
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
    const locatorType = this._invocationCode.substring(start, end);
    this._codeFragmentsContainer.registerLocatorType(
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
    const locatorValue = this._invocationCode.substring(start, end);
    this._codeFragmentsContainer.registerLocatorValue(
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

class CodeFragmentsContainer {
  private _methodInvocationCodeFragment: CodeFragment | undefined = undefined;
  private _argumentsCodeFragment: CodeFragment | undefined = undefined;
  private _locatorCodeFragments: LocatorCodeFragment[] = [];
  private _tmpLocatorTypeCodeFragment: CodeFragment | undefined = undefined;

  constructor(private file: string) {}

  get methodInvocationCodeFragment(): CodeFragment {
    if (this._methodInvocationCodeFragment === undefined) {
      throw new Error("undefined method invocation code");
    }
    return this._methodInvocationCodeFragment;
  }

  get argumentsCodeFragment(): CodeFragment {
    if (this._argumentsCodeFragment === undefined) {
      throw new Error("undefined arguments code");
    }
    return this._argumentsCodeFragment;
  }

  get locatorCodeFragments(): LocatorCodeFragment[] {
    return this._locatorCodeFragments;
  }

  public registerMethodInvocation = (
    string: string,
    lineNum: number,
    start: number,
    end: number
  ) => {
    this._methodInvocationCodeFragment = {
      string,
      file: this.file,
      lineNum,
      start,
      end,
    };
  };

  public registerArguments = (
    string: string,
    lineNum: number,
    start: number,
    end: number
  ) => {
    this._argumentsCodeFragment = {
      string,
      file: this.file,
      lineNum,
      start,
      end,
    };
  };

  public registerLocatorType = (
    locatorType: string,
    lineNum: number,
    start: number,
    end: number
  ) => {
    this._tmpLocatorTypeCodeFragment = {
      string: locatorType,
      file: this.file,
      lineNum,
      start,
      end,
    };
  };

  public registerLocatorValue = (
    locatorValue: string,
    lineNum: number,
    start: number,
    end: number
  ) => {
    if (this._tmpLocatorTypeCodeFragment === undefined) {
      throw new Error("temporary locator type is undefined");
    }
    const locatorValueCodeFragment: CodeFragment = {
      string: locatorValue,
      file: this.file,
      lineNum,
      start,
      end,
    };
    const locatorCodeFragment: LocatorCodeFragment = {
      type: this._tmpLocatorTypeCodeFragment,
      value: locatorValueCodeFragment,
    };
    this._locatorCodeFragments.push(locatorCodeFragment);
  };
}
