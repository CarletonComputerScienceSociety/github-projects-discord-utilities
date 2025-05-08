import { sendDiscordItemMessage } from "../infrastructure/discord";
import { fetchProjectV2Items } from "../infrastructure/github";
import {
  filterByLabel,
  filterForTwentyFourHours,
  filterOutStatus,
} from "../items";

export const urgentPromotionReminder = async () => {
  const githubItemsResult = await fetchProjectV2Items();
  if (githubItemsResult.err) {
    return githubItemsResult;
  }

  const nonBacklogItems = filterOutStatus(githubItemsResult.val, "Backlog");
  const urgentItems = filterForTwentyFourHours(nonBacklogItems);
  const itemsWithLabels = filterByLabel(urgentItems, [
    "discord announcement",
    "social post",
    "scs email",
  ]);

  if (itemsWithLabels.length === 0) {
    console.log("No urgent promotion items");
    return null;
  }

  const message = {
    title: "Urgent Promotional Items Reminder 📬‼️",
    message:
      "Check out all upcoming tasks [here.](https://github.com/orgs/CarletonComputerScienceSociety/projects/18) 🦆",
    sections: [
      ...(itemsWithLabels.length > 0
        ? [
            {
              title: "🔔 Urgent Promotion Items",
              items: itemsWithLabels,
              includeLinks: true,
            },
          ]
        : []),
    ],
  };

  console.log("Sending promotion reminder");
  const discordMessageResult = await sendDiscordItemMessage(message);
  return discordMessageResult;
};
