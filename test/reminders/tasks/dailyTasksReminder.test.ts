import { dailyTasksReminder } from "@src/reminders/tasks/dailyTasksReminder";
import { fetchProjectV2Items } from "@infrastructure/github";
import { sendDiscordItemMessage } from "@infrastructure/discord";
import {
  completeTaskReportMessage,
  simpleTaskReportMessage,
} from "@src/reminders/messages";
import {
  filterOutStatus,
  filterForUnassigned,
  filterUpcomingItems,
  filterForUrgentItems,
} from "@src/items";

// Mock all external dependencies
jest.mock("@infrastructure/github");
jest.mock("@infrastructure/discord");
jest.mock("@src/reminders/messages");
jest.mock("@src/items");

const mockItems = [{ id: 1 }, { id: 2 }];

describe("dailyTasksReminder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (filterOutStatus as jest.Mock).mockReturnValue(mockItems);
    (filterForUnassigned as jest.Mock).mockReturnValue(["unassigned"]);
    (filterUpcomingItems as jest.Mock).mockReturnValue(["upcoming"]);
    (filterForUrgentItems as jest.Mock).mockReturnValue(["urgent"]);
  });

  const mockDayOfWeek = (dayIndex: number) => {
    jest.spyOn(Date.prototype, "getDay").mockReturnValue(dayIndex);
  };

  it("will send a complete report on Tuesday", async () => {
    mockDayOfWeek(2); // Tuesday
    (fetchProjectV2Items as jest.Mock).mockResolvedValue({ val: mockItems });
    (completeTaskReportMessage as jest.Mock).mockReturnValue("full message");
    (sendDiscordItemMessage as jest.Mock).mockResolvedValue({ ok: true });

    const result = await dailyTasksReminder();

    expect(fetchProjectV2Items).toHaveBeenCalled();
    expect(completeTaskReportMessage).toHaveBeenCalledWith({
      urgentItems: ["urgent"],
      unassignedItems: ["unassigned"],
      upcomingItems: ["upcoming"],
    });
    expect(sendDiscordItemMessage).toHaveBeenCalledWith("full message");
    expect(result).toEqual({ ok: true });
  });

  it("will send a simple report on Wednesday", async () => {
    mockDayOfWeek(3); // Wednesday
    (fetchProjectV2Items as jest.Mock).mockResolvedValue({ val: mockItems });
    (simpleTaskReportMessage as jest.Mock).mockReturnValue("simple message");
    (sendDiscordItemMessage as jest.Mock).mockResolvedValue({ ok: true });

    const result = await dailyTasksReminder();

    expect(simpleTaskReportMessage).toHaveBeenCalledWith({
      urgentItems: ["urgent"],
      unassignedItems: ["unassigned"],
    });
    expect(sendDiscordItemMessage).toHaveBeenCalledWith("simple message");
    expect(result).toEqual({ ok: true });
  });

  it("will return early if fetchProjectV2Items fails", async () => {
    const error = { err: "fetch failed" };
    (fetchProjectV2Items as jest.Mock).mockResolvedValue(error);

    const result = await dailyTasksReminder();

    expect(fetchProjectV2Items).toHaveBeenCalled();
    expect(sendDiscordItemMessage).not.toHaveBeenCalled();
    expect(result).toEqual(error);
  });
});
