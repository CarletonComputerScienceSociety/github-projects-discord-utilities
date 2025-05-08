import { fetchProjectV2Items } from "@infrastructure/github";
import { urgentPromotionMessage } from "../messages";
import { sendDiscordItemMessage } from "@infrastructure/discord";
import {
  filterByLabel,
  filterForTwentyFourHours,
  filterOutStatus,
} from "@src/items";

export const promotionReminder = async () => {
  const githubItemsResult = await fetchProjectV2Items();
  if (githubItemsResult.err) {
    return githubItemsResult;
  }

  const nonBacklogItems = filterOutStatus(githubItemsResult.val, "Backlog");
  const urgentItems = filterForTwentyFourHours(nonBacklogItems);
  const itemsWithLabels = filterByLabel(urgentItems, [
    "discord announcement",
    "social post",
    "scs email",
  ]);

  if (itemsWithLabels.length === 0) {
    return null;
  }

  const message = urgentPromotionMessage({
    promotionItems: itemsWithLabels,
  });

  const discordMessageResult = await sendDiscordItemMessage(message);
  return discordMessageResult;
};
