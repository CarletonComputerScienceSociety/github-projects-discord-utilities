import { GithubAPI } from "@infrastructure/github";
import logger from "@src/config/logger";
import { filterOutStatus, filterForUrgentItems } from "@src/items";
import { formatDiscordDate } from "../webhookMessages";
import { UserService } from "@src/items/services/UserService";

const urgencyEmojis = ["⏰", "🚨", "⚠️", "❗", "🧨", "💥"];

function getRandomUrgencyEmoji() {
  return urgencyEmojis[Math.floor(Math.random() * urgencyEmojis.length)];
}

export const urgentItemsDirectMessage = async (client: any) => {
  logger.info({
    event: "dailyTasksReminder.start",
    body: "Running daily task reminder job.",
  });

  const githubItemsResult = await GithubAPI.fetchProjectItems();
  if (githubItemsResult.err) {
    logger.error({
      event: "dailyTasksReminder.fetchError",
      body: githubItemsResult.val.message,
    });
    return;
  }

  const nonBacklogItems = filterOutStatus(githubItemsResult.val, "Backlog");
  const urgentItems = filterForUrgentItems(nonBacklogItems);

  const groupedByDiscordId = new Map<
    string,
    { title: string; dueDate?: Date; url?: string; status?: string }[]
  >();

  for (const item of urgentItems) {
    for (const githubUrl of item.assignedUsers) {
      const githubUsername = githubUrl.split("/").pop();
      if (!githubUsername) continue;

      const userResult =
        await UserService.findUserByGithubUsername(githubUsername);
      if (userResult.err || !userResult.val.discordId) {
        logger.warn({
          event: "dailyTasksReminder.missingMapping",
          body: `No Discord ID found for GitHub user: ${githubUsername}`,
        });
        continue;
      }

      const discordId = userResult.val.discordId;
      const list = groupedByDiscordId.get(discordId) || [];
      list.push({
        title: item.title,
        dueDate: item.dueDate,
        url: item.url,
        status: item.status,
      });
      groupedByDiscordId.set(discordId, list);
    }
  }

  for (const [discordId, issues] of groupedByDiscordId.entries()) {
    try {
      const user = await client.users.fetch(discordId);
      const emoji = getRandomUrgencyEmoji();

      const list = issues
        .map((item) => {
          const titleWithLink = item.url
            ? `[${item.title}](<${item.url}>)`
            : item.title;
          const due = item.dueDate ? formatDiscordDate(item.dueDate) : "";
          const status = item.status ?? "";

          return `\ - ${titleWithLink}${
            due ? ` - ${due}` : ""
          }${status ? ` - ${status}` : ""}`;
        })
        .join("\n");

      const message = `## ${emoji} You have ${issues.length} urgent issue(s): \n\n${list}\n\n*If you can't meet the deadlines or think they should move, please post in the internal server.*`;

      await user.send(message);

      logger.info({
        event: "dailyTasksReminder.dmSuccess",
        body: `Sent DM to ${user.tag} (${discordId})`,
      });
    } catch (err) {
      logger.error({
        event: "dailyTasksReminder.dmError",
        body: `Failed to DM user ${discordId}: ${err}`,
      });
    }
  }

  logger.info({
    event: "dailyTasksReminder.success",
    body: "Daily tasks reminder sent successfully.",
  });
};
