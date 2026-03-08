import * as fs from "node:fs";
import { promises as fsPromises } from "node:fs";
import path from "node:path";
import zlib from "zlib";
import { Readable } from "node:stream";

const compressDir = async () => {
  try {
    const toCompressFolder = path.join(".", "workspace", "toCompress");
    const compressedFolder = path.join(".", "workspace", "compressed");

    await fsPromises.access(toCompressFolder);
    await fsPromises.mkdir(compressedFolder, { recursive: true });

    async function fileContent(filePath) {
      const chunks = [];
      for await (const chunk of fs.createReadStream(filePath)) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      return buffer.toString("base64");
    }

    async function folderContent(folderPath) {
      const elems = await fsPromises.readdir(folderPath, {
        withFileTypes: true,
      });
      const result = [];

      for (const elem of elems) {
        const fullPath = path.join(folderPath, elem.name);
        if (elem.isDirectory()) {
          result.push({
            type: "directory",
            name: elem.name,
            content: await folderContent(fullPath),
          });
        }
        if (elem.isFile()) {
          result.push({
            type: "file",
            name: elem.name,
            content: await fileContent(fullPath),
          });
        }
      }
      return result;
    }

    const archiveData = await folderContent(toCompressFolder);
    const json = JSON.stringify(archiveData);
    const readStream = Readable.from([json]);
    readStream
      .pipe(zlib.createBrotliCompress())
      .pipe(fs.createWriteStream(path.join(compressedFolder, "archive.br")));

  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error("FS operation failed");
    }
    throw err;
  }
};

await compressDir();
