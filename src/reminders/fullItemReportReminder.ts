import { sendDiscordItemMessage } from "../discord";
import { fetchProjectV2Items } from "../github";
import {
  convertGithubItems,
  filterForUnassigned,
  filterForUrgentItems,
  filterOutStatus,
  filterUpcomingItems,
} from "../items";

export const fullItemReportReminder = async () => {
  const githubItemsResult = await fetchProjectV2Items();
  if (githubItemsResult.err) {
    return githubItemsResult;
  }

  const items = convertGithubItems(githubItemsResult.val);
  const nonBacklogItems = filterOutStatus(items, "Backlog");
  const unassignedItems = filterForUnassigned(nonBacklogItems);
  const upcomingItems = filterUpcomingItems(nonBacklogItems);
  const urgentItems = filterForUrgentItems(nonBacklogItems);

  const message = {
    title: "Biweekly Tasks Reminder ☀️🌱",
    message:
      urgentItems.length === 0 &&
      upcomingItems.length &&
      unassignedItems.length === 0
        ? "Nothing urgent or unassigned upcoming! 🐀🥂"
        : "Checkout all upcoming tasks [here.](https://github.com/orgs/CarletonComputerScienceSociety/projects/18) 🐀🐀",
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
      ...(upcomingItems.length > 0
        ? [
            {
              title: "📅 Assigned Items",
              items: upcomingItems,
              includeLinks: false,
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
