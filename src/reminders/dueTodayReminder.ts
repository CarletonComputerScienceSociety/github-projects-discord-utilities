import { sendDiscordItemMessage } from "../discord";
import { fetchProjectV2Items } from "../github";
import {
  convertGithubItems,
  filterForUnassigned,
  filterForUrgentItems,
  filterOutStatus,
} from "../items";

export const dueTodayReminder = async () => {
  const githubItemsResult = await fetchProjectV2Items();
  if (githubItemsResult.err) {
    return githubItemsResult;
  }

  const items = convertGithubItems(githubItemsResult.val);
  const nonBacklogItems = filterOutStatus(items, "Backlog");
  const unassignedItems = filterForUnassigned(nonBacklogItems);
  const urgentItems = filterForUrgentItems(nonBacklogItems);

  const message = {
    title: "Daily Task Reminder 🎉",
    message:
      urgentItems.length === 0 && unassignedItems.length === 0
        ? "Nothing urgent or unassigned today! 🐀🥂"
        : "Checkout all upcoming tasks [here.](https://github.com/orgs/CarletonComputerScienceSociety/projects/18) 👀",
    sections: [
      ...(urgentItems.length > 0
        ? [
            {
              title: "🔥 Urgent & Overdue",
              items: urgentItems,
              includeLinks: true,
            },
          ]
        : []),
      ...(unassignedItems.length > 0
        ? [
            {
              title: "📥  Unassigned Items",
              items: unassignedItems,
              includeLinks: false,
            },
          ]
        : []),
    ],
  };

  const discordMessageResult = await sendDiscordItemMessage(message);
  return discordMessageResult;
};
