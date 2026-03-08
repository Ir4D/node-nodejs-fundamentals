import { promises as fsPromises } from "node:fs";
import path from "node:path";
import { argv } from "node:process";

const findByExt = async () => {
  try {
    const workspacePath = path.resolve("workspace");
    const files = await fsPromises.readdir(workspacePath, {
      withFileTypes: true,
      recursive: true,
    });

    let ext = "txt";
    if (argv.includes("--ext")) {
      ext = argv[argv.length - 1];
    }

    const arrPaths = [];

    for (const file of files) {
      if (file.isFile()) {
        if (file.name.endsWith(ext)) {
          const filePath = path.join(file.parentPath, file.name);
          const relativePath = path
            .relative(workspacePath, filePath)
            .split(path.sep)
            .join("/");
          arrPaths.push(relativePath);
        }
      }
    }

    arrPaths.sort();
    for (const elem of arrPaths) {
      console.log(elem);
    }

  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error("FS operation failed");
    }
    throw err;
  }
};

await findByExt();
