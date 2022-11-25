import { readFile, writeFile } from "fs/promises";
import {
  fixedFileDir,
  fixHistoryFile,
  locatorOrderFile,
} from "./FilePathSetting";

if (process.argv[2] === "show") {
  show(process.argv[3]);
} else if (process.argv[2] === "fix") {
  fix(process.argv[3]);
} else if (process.argv[2] === "clear") {
  clear();
} else if (process.argv[2] === "order") {
  order();
} else {
  throw new Error("Invalid arguments");
}

async function show(fileName: string) {
  const fixedSource = await readFile(`${fixedFileDir}/${fileName}`, "utf-8");
  console.log(fixedSource);
}

async function fix(filePath: string) {
  const fileName = filePath.split("/").slice(-1);
  const fixedSource = await readFile(`${fixedFileDir}/${fileName}`, "utf-8");
  await writeFile(filePath, fixedSource, "utf-8");
}

async function clear() {
  await writeFile(fixHistoryFile, "", "utf-8");
}

async function order() {
  const locatorOrder = await readFile(locatorOrderFile, "utf-8");
  console.log(locatorOrder);
}
