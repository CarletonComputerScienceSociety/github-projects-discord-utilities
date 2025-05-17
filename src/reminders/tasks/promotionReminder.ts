import { GithubAPI } from "@infrastructure/github";
import { urgentPromotionMessage } from "../messages";
import { sendDiscordItemMessage } from "@infrastructure/discord";
import {
  filterByLabel,
  filterForTwentyFourHours,
  filterOutStatus,
} from "@src/items";
import logger from "@config/logger";

export const promotionReminder = async () => {
  logger.info({
    event: "promotionReminder.start",
  });

  const githubItemsResult = await GithubAPI.fetchProjectV2Items();
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
    logger.info({
      event: "promotionReminder.noItems",
      body: "No items found for promotion reminder.",
    });
    return null;
  }

  const message = await urgentPromotionMessage({
    promotionItems: itemsWithLabels,
  });

  const discordMessageResult = await sendDiscordItemMessage(message);

  if (discordMessageResult.ok) {
    logger.info({
      event: "promotionReminder.success",
      body: "Promotion reminder sent successfully.",
    });
  }

  return discordMessageResult;
};
