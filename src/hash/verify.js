import { promises as fsPromises } from "node:fs";
import { createReadStream } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const verify = async () => {
  try {
    const filePath = path.join("./", "checksums.json");
    const jsonString = await fsPromises.readFile(filePath, {
      encoding: "utf8",
    });
    const contents = JSON.parse(jsonString);
    for (const elem in contents) {
      const stream = await createReadStream(path.join("./", elem));
      stream.on("data", (chunk) => {
        const string = crypto.hash("sha256", chunk);
        if (string === contents[elem]) {
          console.log(elem, " — OK");
        } else {
          console.log(elem, " — FAIL");
        }
      });
      stream.on("error", (err) => {
        if (err.code === "ENOENT") {
          throw new Error("FS operation failed");
        }
        throw err;
      });

    }
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error("FS operation failed");
    }
    throw err;
  }
};

await verify();
