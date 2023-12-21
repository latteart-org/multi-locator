"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeLocatorOrder = exports.readLocatorOrder = void 0;
const promises_1 = require("fs/promises");
const FilePathSetting_1 = require("./FilePathSetting");
const getFixHistory = async () => {
    return await (0, promises_1.readFile)(FilePathSetting_1.fixHistoryFile, "utf-8")
        .then((data) => {
        if (data === undefined || data === "") {
            return undefined;
        }
        return JSON.parse(data);
    })
        .catch(async () => {
        await (0, promises_1.mkdir)(FilePathSetting_1.fixedFileDir, { recursive: true });
        await (0, promises_1.writeFile)(FilePathSetting_1.fixHistoryFile, "", "utf-8");
        return undefined;
    });
};
const getBreakageCount = async () => {
    const fixHistory = await getFixHistory();
    if (fixHistory === undefined) {
        return undefined;
    }
    return fixHistory.reduce((breakageCount, cur) => {
        const count = breakageCount.get(cur.locatorCodeFragment.type.string);
        if (count === undefined) {
            breakageCount.set(cur.locatorCodeFragment.type.string, 1);
        }
        else {
            breakageCount.set(cur.locatorCodeFragment.type.string, count + 1);
        }
        return breakageCount;
    }, new Map());
};
const calculateLocatorOrder = async () => {
    const breakageCount = await getBreakageCount();
    if (breakageCount === undefined) {
        return [];
    }
    const locatorOrder = Array.from(breakageCount)
        .sort((a, b) => a[1] - b[1])
        .map(([value, _]) => value);
    return locatorOrder;
};
const readLocatorOrder = async (locatorOrderFile) => {
    const data = await (0, promises_1.readFile)(locatorOrderFile, "utf-8").catch(async () => {
        await (0, promises_1.mkdir)(FilePathSetting_1.fixedFileDir, { recursive: true });
        await (0, promises_1.writeFile)(locatorOrderFile, "", "utf-8");
        return "";
    });
    return data.split("\n").reduce((map, type, order) => {
        return map.set(type, order);
    }, new Map());
};
exports.readLocatorOrder = readLocatorOrder;
const writeLocatorOrder = async (locatorOrderFile) => {
    const locatorOrder = await calculateLocatorOrder();
    const list = locatorOrder.join("\n");
    await (0, promises_1.mkdir)(FilePathSetting_1.fixedFileDir, { recursive: true });
    await (0, promises_1.writeFile)(locatorOrderFile, list, "utf-8");
};
exports.writeLocatorOrder = writeLocatorOrder;
//# sourceMappingURL=LocatorOrder.js.map