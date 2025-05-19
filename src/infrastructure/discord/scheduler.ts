import cron from "node-cron";
import { Client } from "discord.js";
import { urgentItemsDirectMessage } from "./tasks/urgentItemsDirectMessage";

export function schedule(client: Client) {
  // Run at 8:30 AM EST (Eastern Standard Time)
  cron.schedule(
    "30 8 * * *",
    async () => {
      await urgentItemsDirectMessage(client);
    },
    {
      timezone: "America/New_York",
    },
  );
}
