import { fetchProjectV2Items } from "@infrastructure/github";
import {
  completeTaskReportMessage,
  simpleTaskReportMessage,
} from "../messages";
import { sendDiscordItemMessage } from "@infrastructure/discord";
import {
  filterForUnassigned,
  filterForUrgentItems,
  filterOutStatus,
  filterUpcomingItems,
} from "@src/items";
import logger from "@config/logger";

enum Day {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

export const dailyTasksReminder = async () => {
  logger.info({
    event: "dailyTasksReminder.start",
  });

  const githubItemsResult = await fetchProjectV2Items();
  if (githubItemsResult.err) {
    return githubItemsResult;
  }

  const nonBacklogItems = filterOutStatus(githubItemsResult.val, "Backlog");
  const unassignedItems = filterForUnassigned(nonBacklogItems);
  const upcomingItems = filterUpcomingItems(nonBacklogItems);
  const urgentItems = filterForUrgentItems(nonBacklogItems);

  const message = isCompleteReportDay()
    ? completeTaskReportMessage({
        urgentItems,
        unassignedItems,
        upcomingItems,
      })
    : simpleTaskReportMessage({
        urgentItems,
        unassignedItems,
      });

  const discordMessageResult = await sendDiscordItemMessage(message);

  if (discordMessageResult.ok) {
    logger.info({
      event: "dailyTasksReminder.success",
      body: "Daily tasks reminder sent successfully.",
    });
  }

  return discordMessageResult;
};

const isCompleteReportDay = () => {
  const dayOfWeek = Day[new Date().getDay()];
  return ["Tuesday", "Saturday"].includes(dayOfWeek);
};
