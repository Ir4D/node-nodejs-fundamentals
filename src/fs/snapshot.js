import { promises as fsPromises } from "node:fs";
import path from "node:path";

const snapshot = async () => {
  const myData = {};

  try {
    const workspacePath = path.resolve("workspace");

    const files = await fsPromises.readdir(workspacePath, {
      withFileTypes: true,
      recursive: true,
    });

    const rootPath = await fsPromises.realpath("./workspace");

    myData["rootPath"] = rootPath
      .split(path.sep)
      .join("/");
    myData.entries = [];

    for (const file of files) {
      const filePath = path.join(file.parentPath, file.name);
      const relativePath = path
        .relative(workspacePath, filePath)
        .split(path.sep)
        .join("/");
      if (file.isDirectory()) {
        myData.entries.push({ path: relativePath, type: "directory" });
      } else if (file.isFile()) {
        const stats = await fsPromises.stat(filePath);
        const content = await fsPromises.readFile(filePath);
        myData.entries.push({
          path: relativePath,
          type: "file",
          size: stats.size,
          content: content.toString("base64"),
        });
      }
    }

    await fsPromises.writeFile(
      "./snapshot.json",
      JSON.stringify(myData, null, 2),
    );
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("Workspace directory not found");
      throw new Error("FS operation failed");
    }
    throw err;
  }
};

await snapshot();
