import cron from "node-cron";
import { Client } from "discord.js";
import { urgentItemsDirectMessage } from "./tasks/urgentItemsDirectMessage";

export function schedule(client: Client) {
  cron.schedule("30 8 * * *", async () => {
    await urgentItemsDirectMessage(client);
  });
}
