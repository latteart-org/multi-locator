#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "fs/promises";
import {
  fixedFileDir,
  fixHistoryFile,
  locatorOrderFile,
} from "./FilePathSetting";
import { writeLocatorOrder } from "./LocatorOrder";

if (process.argv[2] === "fix") {
  if (process.argv[3] === "show") {
    showFix(process.argv[4]);
  } else if (process.argv[3] === "apply") {
    applyFix(process.argv[4]);
  } else if (process.argv[3] === "clear") {
    clearFixHistory();
  } else {
    console.error(
      "Invalid argument: `multi-locator fix (show <file name> | apply <file path> | clear)"
    );
  }
} else if (process.argv[2] === "order") {
  if (process.argv[3] === "show") {
    showOrder();
  } else if (process.argv[3] === "apply") {
    applyOrder();
  } else {
    console.error("Invalid argument: `multi-locator order (show|apply)");
  }
} else {
  throw new Error(
    "Invalid argument: `multi-locator (fix <command> | order <command>)"
  );
}

async function showFix(fileName: string) {
  if (fileName === undefined) {
    console.error("Specify file name");
    return;
  }
  await readFile(`${fixedFileDir}/${fileName}`, "utf-8")
    .then((fixedSource) => {
      console.log(fixedSource);
    })
    .catch((error) => {
      console.error(error);
    });
}

async function applyFix(filePath: string) {
  if (filePath === undefined) {
    console.error("Specify file path");
    return;
  }
  const fileName = filePath.split("/").slice(-1);
  await readFile(`${fixedFileDir}/${fileName}`, "utf-8")
    .then(async (fixedSource) => {
      await writeFile(filePath, fixedSource, "utf-8");
    })
    .catch((error) => {
      console.error(error);
    });
}

async function clearFixHistory() {
  await writeFile(fixHistoryFile, "", "utf-8").catch(async (error) => {
    await mkdir(fixedFileDir, { recursive: true });
    await writeFile(fixHistoryFile, "", "utf-8");
  });
}

async function showOrder() {
  await readFile(locatorOrderFile, "utf-8")
    .catch(() => {
      console.error("No locator-order.config file");
      console.error("Run some tests and execute `multi-locator order apply`");
    })
    .then((locatorOrder) => {
      if (locatorOrder === "") {
        console.log("No locator order");
      } else {
        console.log(locatorOrder);
      }
    });
}

async function applyOrder() {
  await writeLocatorOrder(locatorOrderFile);
}
