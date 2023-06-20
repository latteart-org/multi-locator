import { TargetLocator } from "./Types";
export declare const readLocatorOrder: (locatorOrderFile: string) => Promise<Map<TargetLocator["type"], number>>;
export declare const writeLocatorOrder: (locatorOrderFile: string) => Promise<void>;
