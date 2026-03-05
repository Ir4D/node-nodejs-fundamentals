import { promises as fsPromises } from "node:fs";
import path from "node:path";

const restore = async () => {
  try {
    const projectFolder = path.join("./", "workspace_restored");
    await fsPromises.mkdir(projectFolder);
    

    const filePath = await fsPromises.realpath("./snapshot.json");
    const jsonString = await fsPromises.readFile(filePath, {
      encoding: "utf8",
    });

    const contents = JSON.parse(jsonString).entries;

    const workspacePath = "./workspace_restored";

    for (const elem of contents) {
      const newPath = path.join(workspacePath, elem.path);
      if (elem.type === "directory") {
        await fsPromises.mkdir(newPath, { recursive: true });
      } else if (elem.type === "file") {
        await fsPromises.mkdir(path.dirname(newPath), { recursive: true });
        await fsPromises.writeFile(newPath, elem.content, {
          encoding: "base64",
        });
      }
    }

  } catch (err) {
    if (err.code === "EEXIST") {
      throw new Error("FS operation failed");
    } else if (err.code === "ENOENT") {
      throw new Error("FS operation failed");
    }
    throw err;
  }
};

await restore();
