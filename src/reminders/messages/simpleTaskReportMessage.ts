import { Item } from "@src/items";
import { DiscordItemMessage } from "@infrastructure/discord";
import { EMOJIS } from "@src/constants";
import { fetchFact } from "@infrastructure/facts";

interface Props {
  urgentItems: Item[];
  unassignedItems: Item[];
}

export const simpleTaskReportMessage = async ({
  urgentItems,
  unassignedItems,
}: Props): Promise<DiscordItemMessage> => {
  const factResult = await fetchFact();
  const randomFact = factResult.ok ? factResult.val : "*Error fetching fact*";
  const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

  const hasUrgent = urgentItems.length > 0;
  const hasUnassigned = unassignedItems.length > 0;

  const baseMessage =
    !hasUrgent && !hasUnassigned
      ? "Nothing urgent or unassigned today! 🐀🥂"
      : "Check out all upcoming tasks [here.](https://github.com/orgs/CarletonComputerScienceSociety/projects/18) 👀";
  const urgentItemsLinkThreshold = 5
  const urgentItemsLinkBool = urgentItems.length <= urgentItemsLinkThreshold
  return {
    title: `Daily Task Reminder ${randomEmoji}`,
    message: `${baseMessage}\n\n💡 **Fun Fact**: ${randomFact}.`,
    sections: [
      ...(hasUrgent
        ? [
            {
              title: "🔥 Urgent & Overdue",
              items: urgentItems,
              includeLinks: urgentItemsLinkBool,
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
