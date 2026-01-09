// utils/runCommand.ts
import { exec, spawn } from "child_process";

export const runCommand = (
  command: string,
  func: "exec" | "spawn" = "exec"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (func === "exec") {
      // ✅ Simple case: exec
      exec(command, (error, stdout, stderr) => {
        if (error) return reject(new Error(error.message));
        if (stderr) return reject(new Error(stderr));
        resolve(stdout.trim());
      });
    } else {
      // ✅ For large output: spawn
      const [cmd, ...args] = command.trim().split(" ");
      if (!cmd) return reject(new Error("Invalid command"));
      const child = spawn(cmd, args, { shell: true });

      let output = "";
      child.stdout.on("data", (data) => (output += data.toString()));
      child.stderr.on("data", (data) =>
        console.error("stderr:", data.toString())
      );

      child.on("error", (err) => reject(err));
      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Command exited with code ${code}`));
        } else {
          resolve(output.trim());
        }
      });
    }
  });
};
