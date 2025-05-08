import { sendDiscordItemMessage } from "@infrastructure/discord";
import { fetchProjectV2Items } from "@infrastructure/github";
import {
  filterForUnassigned,
  filterForUrgentItems,
  filterOutStatus,
} from "../items";

export const dueTodayReminder = async () => {
  const githubItemsResult = await fetchProjectV2Items();
  if (githubItemsResult.err) {
    return githubItemsResult;
  }

  const nonBacklogItems = filterOutStatus(githubItemsResult.val, "Backlog");
  const unassignedItems = filterForUnassigned(nonBacklogItems);
  const urgentItems = filterForUrgentItems(nonBacklogItems);

  const emojis = [
    "🎉",
    "🚀",
    "📅",
    "🔔",
    "📌",
    "📍",
    "✨",
    "🌟",
    "💡",
    "🔍",
    "📈",
    "🏆",
    "🛠",
    "🖌",
    "📝",
    "🗂",
    "📊",
    "📚",
    "🔖",
    "🔗",
    "📎",
    "💼",
    "🗓",
    "🚧",
    "🎯",
    "🧭",
    "🎈",
    "🎠",
    "🏁",
    "✅",
    "📜",
    "📖",
    "🔑",
    "🎁",
    "🔓",
    "🔧",
    "🔨",
    "🛏",
    "🧹",
    "🔥",
    "🕯",
    "🛋",
    "🪑",
    "🚪",
    "🪟",
    "🧸",
    "🖼",
    "🛒",
    "🎊",
    "📯",
    "💖",
    "💫",
    "🌈",
    "🎶",
    "💻",
    "🖥",
    "🖨",
    "🖱",
    "🕹",
    "🗜",
  ];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  const message = {
    title: `Daily Task Reminder ${randomEmoji}`,
    message:
      urgentItems.length === 0 && unassignedItems.length === 0
        ? "Nothing urgent or unassigned today! 🐀🥂"
        : "Check out all upcoming tasks [here.](https://github.com/orgs/CarletonComputerScienceSociety/projects/18) 👀",
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
