#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "fs/promises";
import {
  fixedFileDir,
  fixHistoryFile,
  locatorOrderFile,
} from "./FilePathSetting";
import { writeLocatorOrder } from "./LocatorOrder";

if (process.argv[2] === "show") {
  if (process.argv[3] === "fix") {
    showFix(process.argv[4]);
  } else if (process.argv[3] === "order") {
    showOrder();
  } else {
    console.error("Invalid argument: `muloc show (fix <file name> | order)");
  }
} else if (process.argv[2] === "apply") {
  if (process.argv[3] === "fix") {
    applyFix(process.argv[4]);
  } else if (process.argv[3] === "order") {
    applyOrder();
  } else {
    console.error("Invalid argument: `muloc apply (fix <file path> | order)");
  }
} else if (process.argv[2] === "clear") {
  clearFixHistory();
} else {
  throw new Error(
    "Invalid argument: `muloc (show <arguments> | apply <arguments> | clear)"
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
      console.error("Run some tests and execute `muloc order apply`");
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
