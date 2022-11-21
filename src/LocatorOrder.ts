import { readFile, writeFile } from "fs/promises";
import { LocatorFix } from "./CodeFixer";
import { fixHistoryFile } from "./Constant";
import { TargetLocator } from "./Types";

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

const calculateLocatorOrder = async (): Promise<TargetLocator["type"][]> => {
  const breakageCount = await getBreakageCount();
  const locatorOrder = Array.from(breakageCount)
    .sort((a, b) => a[1] - b[1])
    .map(([value, _]) => value as TargetLocator["type"]);
  return locatorOrder;
};

export const readLocatorOrder = async (
  locatorOrderFile: string
): Promise<Map<TargetLocator["type"], number>> => {
  const data = await readFile(locatorOrderFile, "utf-8");
  return (data.split("\n") as TargetLocator["type"][]).reduce(
    (map, type, order) => {
      return map.set(type, order);
    },
    new Map<TargetLocator["type"], number>()
  );
};

export const writeLocatorOrder = async (locatorOrderFile: string) => {
  const locatorOrder = await calculateLocatorOrder();
  const list = locatorOrder.join("\n");
  await writeFile(locatorOrderFile, list, "utf-8");
};
