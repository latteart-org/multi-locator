import { TargetLocator, WdioDriver } from "../Types";
export declare const wdioProxy: (driver: WdioDriver) => WdioDriver;
export declare const toWdioCompatible: (locator: TargetLocator) => string;
