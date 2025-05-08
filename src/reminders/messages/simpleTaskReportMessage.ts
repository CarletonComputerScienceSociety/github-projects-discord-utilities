import { Item } from "@src/items";
import { DiscordItemMessage } from "@infrastructure/discord";
import { EMOJIS } from "@src/constants";

interface Props {
  urgentItems: Item[];
  unassignedItems: Item[];
}

export const simpleTaskReportMessage = ({
  urgentItems,
  unassignedItems,
}: Props): DiscordItemMessage => {
  const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

  return {
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
};
