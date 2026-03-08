import { promises as fsPromises } from "node:fs";
import path from "node:path";
import { argv } from "node:process";
import { pathToFileURL } from "node:url";

const dynamic = async () => {
  try {
    const folder = path.join("./", "src", "modules", "plugins");
    const specFile = argv[argv.length - 1];
    let filePath;
    if (specFile.includes(".js")) {
      filePath = path.join(folder, specFile);
    } else {
      filePath = path.join(folder, `${specFile}.js`);
    }
    const fullPath = pathToFileURL(filePath).href;
    try {
      await fsPromises.access(filePath);
      const module = await import(fullPath);
      console.log(module.run());
    } catch {
      console.log("Plugin not found");
      process.exit(1);
    }
  } catch (err) {
    throw err;
  }
};

await dynamic();
