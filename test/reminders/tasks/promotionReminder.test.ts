import { promotionReminder } from "@src/reminders/tasks/promotionReminder";
import { fetchProjectV2Items } from "@infrastructure/github";
import { sendDiscordItemMessage } from "@infrastructure/discord";
import { urgentPromotionMessage } from "@src/reminders/messages";
import {
  filterByLabel,
  filterForTwentyFourHours,
  filterOutStatus,
} from "@src/items";

// Mock dependencies
jest.mock("@infrastructure/github");
jest.mock("@infrastructure/discord");
jest.mock("@src/reminders/messages");
jest.mock("@src/items");

const mockItems = [{ id: 1 }, { id: 2 }];
const mockUrgentItems = [{ id: 2 }];
const mockLabeledItems = [{ id: 2, labels: ["social post"] }];

describe("promotionReminder", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (filterOutStatus as jest.Mock).mockReturnValue(mockItems);
    (filterForTwentyFourHours as jest.Mock).mockReturnValue(mockUrgentItems);
    (filterByLabel as jest.Mock).mockReturnValue(mockLabeledItems);
  });

  it("will return early if fetchProjectV2Items fails", async () => {
    const error = { err: "Failed to fetch" };
    (fetchProjectV2Items as jest.Mock).mockResolvedValue(error);

    const result = await promotionReminder();

    expect(fetchProjectV2Items).toHaveBeenCalled();
    expect(sendDiscordItemMessage).not.toHaveBeenCalled();
    expect(result).toEqual(error);
  });

  it("will return null if there are no matching labeled items", async () => {
    (fetchProjectV2Items as jest.Mock).mockResolvedValue({ val: mockItems });
    (filterByLabel as jest.Mock).mockReturnValue([]);

    const result = await promotionReminder();

    expect(fetchProjectV2Items).toHaveBeenCalled();
    expect(sendDiscordItemMessage).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("will send a Discord message if matching items exist", async () => {
    (fetchProjectV2Items as jest.Mock).mockResolvedValue({ val: mockItems });
    (urgentPromotionMessage as jest.Mock).mockReturnValue("promotion message");
    (sendDiscordItemMessage as jest.Mock).mockResolvedValue({ ok: true });

    const result = await promotionReminder();

    expect(fetchProjectV2Items).toHaveBeenCalled();
    expect(filterOutStatus).toHaveBeenCalledWith(mockItems, "Backlog");
    expect(filterForTwentyFourHours).toHaveBeenCalledWith(mockItems);
    expect(filterByLabel).toHaveBeenCalledWith(mockUrgentItems, [
      "discord announcement",
      "social post",
      "scs email",
    ]);
    expect(urgentPromotionMessage).toHaveBeenCalledWith({
      promotionItems: mockLabeledItems,
    });
    expect(sendDiscordItemMessage).toHaveBeenCalledWith("promotion message");
    expect(result).toEqual({ ok: true });
  });
});
