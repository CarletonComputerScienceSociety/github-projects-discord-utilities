import { sendDiscordItemMessage } from "../discord";
import { fetchProjectV2Items } from "../github";
import {
  convertGithubItems,
  filterByLabel,
  filterForTwentyFourHours,
  filterOutStatus,
} from "../items";
import { fetchFacts } from ".";

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
    console.log("No urgent promotion items");
    return null;
  }

  const factResult = await fetchFacts();
  const fact = `${factResult}`;

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
    fact: fact,
  };

  console.log("Sending promotion reminder");
  const discordMessageResult = await sendDiscordItemMessage(message);
  return discordMessageResult;
};
