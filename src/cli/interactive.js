import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import process from "node:process";
import path from "node:path";

const interactive = () => {
  const rl = readline.createInterface({ input, output, prompt: "> "});
  rl.prompt();

  rl.on("line", (line) => {
    if (line.trim() == "uptime") {
      const repl = process.uptime().toFixed(2) + "s";
      console.log(repl);
    } else if (line.trim() == "cwd") {
      const currentDir = path.resolve(".");
      console.log(currentDir);
    } else if (line.trim() == "date") {
      const now = new Date();
      console.log(now.toISOString());
    } else if (line.trim() == "exit") {
      rl.close();
    } else {
      console.log("Unknown command");
    }
    rl.prompt();
  }); 

  rl.on("close", () => {
    console.log("Goodbye!");
    process.exit();
  });
};

interactive();
