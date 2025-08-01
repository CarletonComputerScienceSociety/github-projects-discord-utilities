import { GithubAPI } from "@infrastructure/github";
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

  const githubItemsResult = await GithubAPI.fetchProjectItems();
  if (githubItemsResult.err) {
    return githubItemsResult;
  }
  const nonIceboxItems = filterOutStatus(githubItemsResult.val, "Ice Box");
  const nonBacklogItems = filterOutStatus(nonIceboxItems, "Backlog");
  const unassignedItems = filterForUnassigned(nonBacklogItems);
  const upcomingItems = filterUpcomingItems(nonBacklogItems);
  const urgentItems = filterForUrgentItems(nonBacklogItems);

  const message = isCompleteReportDay()
    ? await completeTaskReportMessage({
        urgentItems,
        unassignedItems,
        upcomingItems,
      })
    : await simpleTaskReportMessage({
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
