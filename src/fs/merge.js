import { promises as fsPromises } from "node:fs";
import path from "node:path";
import { argv } from "node:process";

const merge = async () => {
  try {
    const folder = path.join("./", "workspace", "parts");
    const files = await fsPromises.readdir(folder, {
      withFileTypes: true,
      recursive: true,
    });

    const filesArr = [];
    let specFiles = null;

    if (argv.includes("--files")) {
      specFiles = argv[argv.length - 1];
      specFiles = specFiles.split(",");
      filesArr.push(...specFiles);

      for (const file of filesArr) {
        try {
          await fsPromises.access(path.join(folder, file));
        } catch {
          throw new Error("FS operation failed");
        }
      }
    } else {
      for (const file of files) {
        if (file.name.endsWith("txt")) {
          filesArr.push(file.name);
        }
      }
      if (filesArr.length === 0) {
        throw new Error("FS operation failed");
      }
    }

    filesArr.sort();
    let data = "";

    for (const file of filesArr) {
      const filePath = path.join(folder, file);
      const contents = await fsPromises.readFile(filePath, {encoding: "utf8",});
      data += " " + contents;
    }

    const mergedFilePath = path.join("./", "workspace", "merged.txt");
    await fsPromises.writeFile(mergedFilePath, data);
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error("FS operation failed");
    }
    throw err;
  }
};

await merge();
