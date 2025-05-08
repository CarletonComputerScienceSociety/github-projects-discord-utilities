import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { simpleTaskReportMessage } from "@src/reminders/messages";
import { itemFactory } from "../../factories/itemFactory";

// Mock @src/constants and override EMOJIS
jest.mock("@src/constants", () => ({
  EMOJIS: ["🧪"],
}));

// Mock @infrastructure/facts
jest.mock("@infrastructure/facts", () => ({
  fetchFact: jest.fn(),
}));

import { fetchFact } from "@infrastructure/facts";

describe("simpleTaskReportMessage", () => {
  // Define the mocked return shape explicitly
  beforeEach(() => {
    // @ts-ignore – mocking return type to match Result<string, Error>
    (fetchFact as jest.Mock).mockResolvedValue({
      ok: true,
      val: "Fun facts make reports better",
    });
  });

  it("returns default message when both urgent and unassigned are empty", async () => {
    const result = await simpleTaskReportMessage({
      urgentItems: [],
      unassignedItems: [],
    });

    expect(result.title).toBe("Daily Task Reminder 🧪");
    expect(result.message).toContain(
      "Nothing urgent or unassigned today! 🐀🥂",
    );
    expect(result.message).toContain(
      "💡 **Fun Fact**: Fun facts make reports better.",
    );
    expect(result.sections).toEqual([]);
  });

  it("includes urgent section when there are urgent items", async () => {
    const urgent = [itemFactory()];

    const result = await simpleTaskReportMessage({
      urgentItems: urgent,
      unassignedItems: [],
    });

    expect(result.message).toContain("Check out all upcoming tasks");
    expect(result.message).toContain(
      "💡 **Fun Fact**: Fun facts make reports better.",
    );
    expect(result.sections).toEqual([
      {
        title: "🔥 Urgent & Overdue",
        items: urgent,
        includeLinks: true,
      },
    ]);
  });

  it("includes unassigned section when there are unassigned items", async () => {
    const unassigned = [itemFactory()];

    const result = await simpleTaskReportMessage({
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
    expect(result.message).toContain(
      "💡 **Fun Fact**: Fun facts make reports better.",
    );
  });

  it("includes both sections when both item types are present", async () => {
    const urgent = [itemFactory()];
    const unassigned = [itemFactory()];

    const result = await simpleTaskReportMessage({
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
    expect(result.message).toContain(
      "💡 **Fun Fact**: Fun facts make reports better.",
    );
  });
});
