import process from "node:process";
import { argv } from "node:process";

const progress = () => {
  let percent = 0;
  let length = 30;
  let duration = 5000;
  let interval = 100;
  let hex, r, g, b;
  let bar = "█";;
  
  if (argv.includes("--duration")) {
    duration = argv[argv.length - 1];
  } else if (argv.includes("--interval")) {
    interval = argv[argv.length - 1];
  } else if (argv.includes("--length")) {
    length = argv[argv.length - 1];
  } else if (argv.includes("--color")) {
    hex = argv[argv.length - 1];
  }

  const step = 100 / (duration / interval);

  function isValidHex(hex) {
    const regex = /^#?[0-9A-Fa-f]{6}$/;
    return regex.test(hex);
  }
  if (isValidHex(hex)) {
    if (hex[0] === "#") {
      hex = hex.slice(1);
    }
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
    bar = `\x1b[38;2;${r};${g};${b}m█\x1b[0m`;
  }

  const timer = setInterval(() => {
    const filled = Math.ceil((percent / 100) * length);
    const empty = length - filled;
    process.stdout.write(
      `\r[${bar.repeat(filled) + " ".repeat(empty)}] ${percent}%`,
    );
    percent = percent + step;
    if (percent > 100) {
      clearInterval(timer);
      console.log("\nDone!");
    }
  }, interval);
};

progress();
