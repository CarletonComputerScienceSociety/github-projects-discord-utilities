import { sendDiscordItemMessage } from "../discord";
import { fetchProjectV2Items } from "../github";
import {
  convertGithubItems,
  filterByLabel,
  filterForTwentyFourHours,
  filterForUrgentItems,
  filterOutStatus,
} from "../items";

export const urgentPromotionReminder = async () => {
  const githubItemsResult = await fetchProjectV2Items();
  if (githubItemsResult.err) {
    return githubItemsResult;
  }

  const items = convertGithubItems(githubItemsResult.val);
  const nonBacklogItems = filterOutStatus(items, "Backlog");
  const urgentItems = filterForTwentyFourHours(nonBacklogItems);
  const itemsWithLabels = filterByLabel(urgentItems, [
    "discord announcement",
    "social post",
    "scs email",
  ]);

  if (itemsWithLabels.length === 0) {
    return null;
  }

  const message = {
    title: "Urgent Promotional Items Reminder 📬‼️",
    message:
      "Check out all upcoming tasks [here.](https://github.com/orgs/CarletonComputerScienceSociety/projects/18) 🐀🐀",
    sections: [
      ...(itemsWithLabels.length > 0
        ? [
            {
              title: "🔥 Urgent & Overdue",
              items: itemsWithLabels,
            },
          ]
        : []),
    ],
  };

  const discordMessageResult = await sendDiscordItemMessage(message);
  return discordMessageResult;
};
