import { readFile } from "fs/promises";
import { LocatorFix } from "./CodeFixer";
import { TargetLocator } from "./Types";

const dataDir = ".multi-locator";
export const fixHistoryFile = `${dataDir}/fix_history.json`;
export const fixedFileDir = `${dataDir}/fixed`;
export const locatorOrderFile = `${dataDir}/locator-order.config`;

const getFixHistory = async (): Promise<LocatorFix[]> => {
  const data = await readFile(fixHistoryFile, "utf-8");
  return JSON.parse(data) as LocatorFix[];
};

const getBreakageCount = async (): Promise<Map<string, number>> => {
  const fixHistory = await getFixHistory();
  return fixHistory.reduce((breakageCount, cur) => {
    const count = breakageCount.get(cur.locatorCodeFragment.type.string);
    if (count === undefined) {
      breakageCount.set(cur.locatorCodeFragment.type.string, 1);
    } else {
      breakageCount.set(cur.locatorCodeFragment.type.string, count + 1);
    }
    return breakageCount;
  }, new Map<string, number>());
};

export const calculateLocatorOrder = async (): Promise<
  TargetLocator["type"][]
> => {
  const breakageCount = await getBreakageCount();
  const locatorOrder = Array.from(breakageCount)
    .sort((a, b) => a[1] - b[1])
    .map(([value, _]) => value as TargetLocator["type"]);
  return locatorOrder;
};

export const readLocatorOrderFile = async (): Promise<
  Map<TargetLocator["type"], number>
> => {
  const data = await readFile(locatorOrderFile, "utf-8");
  return (data.split("\n") as TargetLocator["type"][]).reduce(
    (map, type, order) => {
      return map.set(type, order);
    },
    new Map<TargetLocator["type"], number>()
  );
};
