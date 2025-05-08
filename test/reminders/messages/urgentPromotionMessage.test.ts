import { describe, expect, it } from "@jest/globals";
import { urgentPromotionMessage } from "@src/reminders/messages";
import { itemFactory } from "../../factories/itemFactory";

describe("urgentPromotionMessage", () => {
  it("will return message without sections when there are no promotion items", async () => {
    const result = await urgentPromotionMessage({ promotionItems: [] });

    expect(result.title).toBe("Urgent Promotional Items Reminder 📬‼️");
    expect(result.message).toBe(
      "Check out all upcoming tasks [here.](https://github.com/orgs/CarletonComputerScienceSociety/projects/18) 🦆",
    );
    expect(result.sections).toEqual([]);
  });

  it("will include promotion section when promotion items are present", async () => {
    const promotionItems = [itemFactory(), itemFactory()];

    const result = await urgentPromotionMessage({ promotionItems });

    expect(result.sections).toEqual([
      {
        title: "🔔 Urgent Promotion Items",
        items: promotionItems,
        includeLinks: true,
      },
    ]);
  });
});
