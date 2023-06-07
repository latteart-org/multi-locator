import fs, { mkdir, readFile, unlink } from "fs/promises";
import { readLocatorOrder, writeLocatorOrder } from "../../src/LocatorOrder";

// import Rewire from "rewire";
describe("Test LocatorOrder", () => {
  it("Read locator order from file", async () => {
    const readFileMock = jest.spyOn(fs, "readFile");
    readFileMock.mockImplementation(
      async () => `id\ninnerText\ncss\nname\nxpath`
    );
    const locatorOrder = await readLocatorOrder("dummy");
    const expected = new Map([
      ["id", 0],
      ["innerText", 1],
      ["css", 2],
      ["name", 3],
      ["xpath", 4],
    ]);
    expect(locatorOrder).toEqual(expected);
  });

  it("Write Locator order to file", async () => {
    const locatorOrderFile = "test/resource/tmp/locator-order.config";
    const readFileMock = jest.spyOn(fs as any, "readFile");
    readFileMock.mockImplementation(
      async () => `[
  {
    "locatorCodeFragment": {
      "file": "file1",
      "type": { "string": "xpath", "lineNum": 7, "start": 9, "end": 14 }
    }
  },
  {
    "locatorCodeFragment": {
      "file": "file1",
      "type": { "string": "xpath", "lineNum": 7, "start": 9, "end": 14 }
    }
  },
  {
    "locatorCodeFragment": {
      "file": "file1",
      "type": { "string": "id", "lineNum": 7, "start": 9, "end": 14 }
    }
  }
]`
    );
    await mkdir("test/resource/tmp", { recursive: true });
    await writeLocatorOrder(locatorOrderFile);
    readFileMock.mockRestore();

    const locatorOrder = await readFile(locatorOrderFile, "utf-8");
    expect(locatorOrder).toBe("id\nxpath");

    await unlink(locatorOrderFile);
  });
});
