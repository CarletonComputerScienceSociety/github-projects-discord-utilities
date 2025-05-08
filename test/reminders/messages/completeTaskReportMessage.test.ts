import { completeTaskReportMessage } from "@src/reminders/messages";
import { itemFactory } from "../../factories/itemFactory";
import { Item } from "@src/items";

describe("completeTaskReportMessage", () => {
  it("will show the default message when there are no urgent or unassigned items", () => {
    const urgentItems: Item[] = [];
    const unassignedItems: Item[] = [];
    const upcomingItems: Item[] = [itemFactory()];

    const result = completeTaskReportMessage({
      urgentItems,
      unassignedItems,
      upcomingItems,
    });

    expect(result.title).toBe("Biweekly Tasks Reminder ☀️🌱");
    expect(result.message).toBe("Nothing urgent or unassigned upcoming! 🐀🥂");
    expect(result.sections).toEqual([
      {
        title: "📅 Assigned Items",
        items: upcomingItems,
        includeLinks: false,
      },
    ]);
  });

  it("will include the urgent section when there are urgent items", () => {
    const urgentItems: Item[] = [itemFactory()];
    const unassignedItems: Item[] = [];
    const upcomingItems: Item[] = [];

    const result = completeTaskReportMessage({
      urgentItems,
      unassignedItems,
      upcomingItems,
    });

    expect(result.message).toContain("Check out all upcoming tasks");
    expect(result.sections).toEqual([
      {
        title: "🔥 Urgent & Overdue",
        items: urgentItems,
        includeLinks: true,
      },
    ]);
  });

  it("will include the unassigned section when there are unassigned items", () => {
    const urgentItems: Item[] = [];
    const unassignedItems: Item[] = [itemFactory()];
    const upcomingItems: Item[] = [];

    const result = completeTaskReportMessage({
      urgentItems,
      unassignedItems,
      upcomingItems,
    });

    expect(result.sections).toEqual([
      {
        title: "📥  Unassigned Items",
        items: unassignedItems,
        includeLinks: false,
      },
    ]);
  });

  it("includes all sections when all item types are present", () => {
    const urgentItems: Item[] = [itemFactory()];
    const unassignedItems: Item[] = [itemFactory()];
    const upcomingItems: Item[] = [itemFactory()];

    const result = completeTaskReportMessage({
      urgentItems,
      unassignedItems,
      upcomingItems,
    });

    expect(result.sections).toEqual([
      {
        title: "🔥 Urgent & Overdue",
        items: urgentItems,
        includeLinks: true,
      },
      {
        title: "📅 Assigned Items",
        items: upcomingItems,
        includeLinks: false,
      },
      {
        title: "📥  Unassigned Items",
        items: unassignedItems,
        includeLinks: false,
      },
    ]);
  });

  it("returns no sections and default message when all item arrays are empty", () => {
    const result = completeTaskReportMessage({
      urgentItems: [],
      unassignedItems: [],
      upcomingItems: [],
    });

    expect(result.message).toBe(
      "Check out all upcoming tasks [here.](https://github.com/orgs/CarletonComputerScienceSociety/projects/18) 🐀🐀",
    );
    expect(result.sections).toEqual([]);
  });
});
