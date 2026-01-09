import cron from "node-cron";
import { getSettingStatus } from "../services/setting.service";
import { runCommand } from "../utils/run-command";

export const maintenanceJob = cron.schedule("* 5 * * *", async () => {
  const maintenance = await getSettingStatus("maintenance");
  if (maintenance?.value === "on") {
    console.log("Running pnpm dev:up at", new Date().toISOString());

    const command =
      process.env.APP_ENV === "production" ? "pnpm app:up" : "pnpm dev:up";

    (async () => {
      try {
        const output = await runCommand(command);
        console.log("✅ Success:", output);
      } catch (err: any) {
        console.error("❌ Failed:", err.message);
      }
    })();
  }
});
