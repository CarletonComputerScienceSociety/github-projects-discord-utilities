import axios from "axios";
import { Err, Ok, Result } from "ts-results";
import githubDiscordMap from "../../data/githubDiscordMap.json";
import { Item } from "../items";

export interface DiscordItemMessage {
  title: string;
  sections: {
    title: string;
    items: Item[];
  }[];
  message: string;
}

// TODO: any type
export const sendDiscordItemMessage = async (
  message: DiscordItemMessage,
): Promise<Result<any, Error>> => {
  // TODO: move to .env
  const webhookUrl =
    "https://discord.com/api/webhooks/1251460718113587234/hJXdhq5KCJHAYAoA-9ie_2FVuwr7rNJIB7FjyPgvDR544sKJgo507x7jVn_qsoHWZB_O";

  // const webhookUrl =
  //   "https://discord.com/api/webhooks/1251302978720239726/UgldsmHJfbdpZ9cLDeeGXEI34FsQU4RPAh7tMqccWYsTv-mXPK13wwAiM-lqfveHN4nM";

  const messageHeader = formatMessageTitle(message.title, message.message);
  const messageSections = message.sections.map((section) => {
    const sectionHeader = formatMessageSectionTitle(section.title);
    const sectionItems = section.items
      .map((item) => formatItem(item))
      .join("\n");
    return `${sectionHeader} ${sectionItems}`;
  });

  try {
    const response = await axios.post(webhookUrl, {
      content: `${messageHeader} ${messageSections.join()}`,
    });
    return Ok(response.data);
  } catch (error) {
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
  return `<t:${Math.floor(date.getTime() / 1000)}>`;
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
  return `- ${item.title}: ${formatDiscordAssignees(item.assignedUsers)} - ${item?.dueDate ? formatDiscordDate(item.dueDate) : ""} - ${item.status}`;
};

// TODO: discord embeds spam the channel
const formatItemWithLink = (item: Item) => {
  return `- [${item.title}](${item.url}): ${formatDiscordAssignees(item.assignedUsers)} - ${item.dueDate ? formatDiscordDate(item.dueDate) : ""} - ${item.status}`;
};
