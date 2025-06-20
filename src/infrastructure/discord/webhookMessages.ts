import axios from "axios";
import { Err, Ok, Result } from "ts-results";
import dotenv from "dotenv";
import { UserService } from "@src/items/services/UserService";
import { Item } from "../../items";
import logger from "@config/logger";

dotenv.config();

export interface DiscordItemMessage {
  title: string;
  sections: {
    title: string;
    items: Item[];
    includeLinks: boolean;
  }[];
  message: string;
}

export const sendDiscordAlertMessage = async (
  message: string,
): Promise<Result<any, Error>> => {
  const alertWebhook = process.env.DISCORD_ALERTS_WEBHOOK_URL ?? "";
  await axios.post(alertWebhook, {
    content: `Failed to send Discord message: ${message}`,
  });
  return Ok("Alert sent");
};

// TODO: any type
export const sendDiscordItemMessage = async (
  message: DiscordItemMessage,
): Promise<Result<any, Error>> => {
  const webhookUrl = process.env.DISCORD_CHANNEL_WEBHOOK_URL ?? "";
  const messageHeader = formatMessageTitle(message.title, message.message);
  const messageSections = message.sections.map((section) => {
    const sectionHeader = formatMessageSectionTitle(section.title);
    const sectionItems = section.items
      .map((item) =>
        section.includeLinks ? formatItemWithLink(item) : formatItem(item),
      )
      .join("\n");
    return `${sectionHeader} ${sectionItems}`;
  });

  try {
    const response = await axios.post(webhookUrl, {
      content: `${messageHeader} ${messageSections.join()}`,
    });
    return Ok(response.data);
  } catch (error) {
    logger.error({
      event: "github.fetchProjectV2Items.error",
      body: error instanceof Error ? error.message : "Failed to fetch data",
    });
    return Err(new Error("Failed to send Discord message"));
  }
};

export const formatDiscordDate = (date: Date) => {
  return `<t:${Math.floor(date.getTime() / 1000)}:D>`;
};

const formatMessageTitle = (title: string, message: string) => {
  return `# ${title} \n ${message}`;
};

const formatMessageSectionTitle = (title: string) => {
  return `\n### ${title}: \n`;
};

const formatDiscordAssignees = async (assignees: string[]) => {
  const mentions = await Promise.all(
    assignees.map(async (githubUrl) => {
      const githubUsername = githubUrl.replace("https://github.com/", "");
      const userResult =
        await UserService.findUserByGithubUsername(githubUsername);

      return userResult.ok ? `<@${userResult.val.discordId}>` : githubUsername;
    }),
  );

  return mentions.join(", ");
};

const formatItem = (item: Item) => {
  return `- ${item.title}: ${formatDiscordAssignees(item.assignedUsers)} - ${item.dueDate ? formatDiscordDate(item.dueDate) : ""} - ${item.status}`;
};

const formatItemWithLink = (item: Item) => {
  return `- [${item.title}](<${item.url}>): ${formatDiscordAssignees(item.assignedUsers)} - ${item.dueDate ? formatDiscordDate(item.dueDate) : ""} - ${item.status}`;
};
