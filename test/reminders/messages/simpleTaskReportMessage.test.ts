import { describe, expect, it, jest } from "@jest/globals";
import { simpleTaskReportMessage } from "@src/reminders/messages";
import { itemFactory } from "../../factories/itemFactory";

// Mock @src/constants and override EMOJIS
jest.mock("@src/constants", () => ({
  EMOJIS: ["🧪"],
}));

describe("simpleTaskReportMessage", () => {
  it("will return default message when both urgent and unassigned are empty", () => {
    const result = simpleTaskReportMessage({
      urgentItems: [],
      unassignedItems: [],
    });

    expect(result.title).toBe("Daily Task Reminder 🧪");
    expect(result.message).toBe("Nothing urgent or unassigned today! 🐀🥂");
    expect(result.sections).toEqual([]);
  });

  it("will include urgent section when there are urgent items", () => {
    const urgent = [itemFactory()];

    const result = simpleTaskReportMessage({
      urgentItems: urgent,
      unassignedItems: [],
    });

    expect(result.message).toContain("Check out all upcoming tasks");
    expect(result.sections).toEqual([
      {
        title: "🔥 Urgent & Overdue",
        items: urgent,
        includeLinks: true,
      },
    ]);
  });

  it("will include unassigned section when there are unassigned items", () => {
    const unassigned = [itemFactory()];

    const result = simpleTaskReportMessage({
      urgentItems: [],
      unassignedItems: unassigned,
    });

    expect(result.sections).toEqual([
      {
        title: "📥  Unassigned Items",
        items: unassigned,
        includeLinks: false,
      },
    ]);
  });

  it("will include both sections when both item types are present", () => {
    const urgent = [itemFactory()];
    const unassigned = [itemFactory()];

    const result = simpleTaskReportMessage({
      urgentItems: urgent,
      unassignedItems: unassigned,
    });

    expect(result.sections).toEqual([
      {
        title: "🔥 Urgent & Overdue",
        items: urgent,
        includeLinks: true,
      },
      {
        title: "📥  Unassigned Items",
        items: unassigned,
        includeLinks: false,
      },
    ]);
  });
});
