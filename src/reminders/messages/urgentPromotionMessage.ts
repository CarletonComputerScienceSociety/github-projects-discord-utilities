import { DiscordItemMessage } from "@infrastructure/discord";
import { Item } from "@src/items";

interface Props {
  promotionItems: Item[];
}

export const urgentPromotionMessage = ({
  promotionItems,
}: Props): DiscordItemMessage => {
  return {
    title: "Urgent Promotional Items Reminder 📬‼️",
    message:
      "Check out all upcoming tasks [here.](https://github.com/orgs/CarletonComputerScienceSociety/projects/18) 🦆",
    sections: [
      ...(promotionItems.length > 0
        ? [
            {
              title: "🔔 Urgent Promotion Items",
              items: promotionItems,
              includeLinks: true,
            },
          ]
        : []),
    ],
  };
};
