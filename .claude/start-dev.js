// Launcher used by the Claude Code preview tool from a sibling worktree.
// Switches the cwd into this project before booting Next, since the
// preview tool starts the process with the worktree as its cwd.
const { spawn } = require("child_process");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextBin, "dev", "-p", "3001"], {
  cwd: projectRoot,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
