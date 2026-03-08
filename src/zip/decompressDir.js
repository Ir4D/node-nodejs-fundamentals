import * as fs from "node:fs";
import { promises as fsPromises } from "node:fs";
import path from "node:path";
import zlib from "zlib";
import { Readable } from "node:stream";

const decompressDir = async () => {
  try {
    const compressedFolder = path.join(".", "workspace", "compressed");
    const decompressedFolder = path.join(".", "workspace", "decompressed");
    const archive = path.join(".", "workspace", "compressed", "archive.br");

    await fsPromises.access(compressedFolder);
    await fsPromises.access(archive);
    await fsPromises.mkdir(decompressedFolder, { recursive: true });

    async function archiveContent(filePath) {
      const chunks = [];
      const readStream = fs.createReadStream(filePath);
      const brotli = zlib.createBrotliDecompress();
      readStream.pipe(brotli);
      for await (const chunk of brotli) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      return JSON.parse(buffer.toString());
    }

    async function restoreContent(folderPath, elems) {
      for (const elem of elems) {
        const fullPath = path.join(folderPath, elem.name);

        if (elem.type === "directory") {
          await fsPromises.mkdir(fullPath, { recursive: true });
          await restoreContent(fullPath, elem.content);
        }

        if (elem.type === "file") {
          const buffer = Buffer.from(elem.content, "base64");
          await fsPromises.writeFile(fullPath, buffer);
        }
      }
    }

    const archiveData = await archiveContent(archive);
    await restoreContent(decompressedFolder, archiveData);
    
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error("FS operation failed");
    }
    throw err;
  }
};

await decompressDir();
