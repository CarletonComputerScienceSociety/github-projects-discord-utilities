import { DiscordItemMessage } from "@infrastructure/discord";
import { Item } from "@src/items";

interface Props {
  urgentItems: Item[];
  unassignedItems: Item[];
  upcomingItems: Item[];
}

export const completeTaskReportMessage = ({
  urgentItems,
  unassignedItems,
  upcomingItems,
}: Props): DiscordItemMessage => {
  return {
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
};
