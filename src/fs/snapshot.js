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
    myData["rootPath"] = await fsPromises.realpath("./workspace");
    myData.entries = [];

    for (const file of files) {
      if (file.isDirectory()) {
        myData.entries.push({ path: file.name, type: "directory" });
      } else if (file.isFile()) {
        const fName = path.join(file.parentPath, file.name);
        const stats = await fsPromises.stat(fName);
        const content = await fsPromises.readFile(fName);
        myData.entries.push({
          path: file.name,
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
