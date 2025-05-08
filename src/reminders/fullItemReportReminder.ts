import { sendDiscordItemMessage } from "../infrastructure/discord";
import { fetchProjectV2Items } from "../infrastructure/github";
import {
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

  const nonBacklogItems = filterOutStatus(githubItemsResult.val, "Backlog");
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
        : "Check out all upcoming tasks [here.](https://github.com/orgs/CarletonComputerScienceSociety/projects/18) 🐀🐀",
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
