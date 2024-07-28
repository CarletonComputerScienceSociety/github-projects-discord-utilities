import axios from "axios";
import { Err, Ok, Result } from "ts-results";
import dotenv from "dotenv";
import githubDiscordMap from "../../data/githubDiscordMap.json";
import { Item } from "../items";

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
    const alertWebhook = process.env.DISCORD_ALERTS_WEBHOOK_URL ?? "";

    await axios.post(alertWebhook, {
      // @ts-ignore
      content: `Failed to send Discord message: ${error.message}`,
    });
    return Err(new Error("Failed to send Discord message"));
  }
};

const githubUrlToDiscordId = (githubUrl: string) => {
  return githubDiscordMap[
    githubUrl.replace(
      "https://github.com/",
      "",
    ) as keyof typeof githubDiscordMap
  ];
};

const formatDiscordDate = (date: Date) => {
  return `<t:${Math.floor(date.getTime() / 1000)}:D>`;
};

const formatMessageTitle = (title: string, message: string) => {
  return `# ${title} \n ${message}`;
};

const formatMessageSectionTitle = (title: string) => {
  return `\n### ${title}: \n`;
};

const formatDiscordAssignees = (assignees: string[]) => {
  // TODO: we should filter out the github url before getting to this stuff
  return assignees
    .map((assignee) => {
      const discordId = githubUrlToDiscordId(assignee);
      if (discordId) {
        return `<@${discordId}>`;
      } else {
        return assignee;
      }
    })
    .join(", ");
};

const formatItem = (item: Item) => {
  return `- ${item.title}: ${formatDiscordAssignees(item.assignedUsers)} - ${item.dueDate ? formatDiscordDate(item.dueDate) : ""} - ${item.status}`;
};

const formatItemWithLink = (item: Item) => {
  return `- [${item.title}](<${item.url}>): ${formatDiscordAssignees(item.assignedUsers)} - ${item.dueDate ? formatDiscordDate(item.dueDate) : ""} - ${item.status}`;
};
