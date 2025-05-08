import { DiscordItemMessage } from "@infrastructure/discord";
import { Item } from "@src/items";

interface Props {
  urgentItems: Item[];
  unassignedItems: Item[];
  upcomingItems: Item[];
}

export const completeTaskReportMessage = async ({
  urgentItems,
  unassignedItems,
  upcomingItems,
}: Props): Promise<DiscordItemMessage> => {
  const hasUrgent = urgentItems.length > 0;
  const hasUpcoming = upcomingItems.length > 0;
  const hasUnassigned = unassignedItems.length > 0;

  const baseMessage =
    !hasUrgent && hasUpcoming && !hasUnassigned
      ? "Nothing urgent or unassigned upcoming! 🐀🥂"
      : "Check out all upcoming tasks [here.](https://github.com/orgs/CarletonComputerScienceSociety/projects/18) 🐀🐀";

  return {
    title: "Biweekly Tasks Reminder ☀️🌱",
    message: `${baseMessage}`,
    sections: [
      ...(hasUrgent
        ? [
            {
              title: "🔥 Urgent & Overdue",
              items: urgentItems,
              includeLinks: true,
            },
          ]
        : []),
      ...(hasUpcoming
        ? [
            {
              title: "📅 Assigned Items",
              items: upcomingItems,
              includeLinks: false,
            },
          ]
        : []),
      ...(hasUnassigned
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
