import { describe, expect } from "@jest/globals";
import {
  filterByDateRange,
  filterByStatus,
  filterForUnassigned,
  filterForUrgentItems,
  filterOutStatus,
  filterUpcomingItems,
} from "../../src/items";
import { itemFactory } from "./factories/item-factory";

describe("filterByStatus", () => {
  it("will return items with the given status", () => {
    const item1 = itemFactory({ status: "Done" });
    const item2 = itemFactory({ status: "Todo" });

    const result = filterByStatus([item1, item2], "Done");

    expect(result).toEqual([item1]);
  });
});

describe("filterOutStatus", () => {
  it("will return items without the given status", () => {
    const item1 = itemFactory({ status: "Done" });
    const item2 = itemFactory({ status: "Todo" });

    const result = filterOutStatus([item1, item2], "Todo");

    expect(result).toEqual([item1]);
  });
});

describe("filterForUnassigned", () => {
  it("will return items without assigned users", () => {
    const item1 = itemFactory({ assignedUsers: [] });
    const item2 = itemFactory({ assignedUsers: ["user"] });

    const result = filterForUnassigned([item1, item2]);

    expect(result).toEqual([item1]);
  });
});

describe("filterByDateRange", () => {
  it("will return items within the given date range", () => {
    const item1 = itemFactory({ dueDate: new Date("2021-10-10") });
    const item2 = itemFactory({ dueDate: new Date("2021-10-20") });

    const result = filterByDateRange(
      [item1, item2],
      new Date("2021-10-15"),
      new Date("2021-10-25"),
    );

    expect(result).toEqual([item2]);
  });

  it("will return items on the lower bound of the date range", () => {
    const item1 = itemFactory({ dueDate: new Date("2021-10-15") });

    const result = filterByDateRange(
      [item1],
      new Date("2021-10-15"),
      new Date("2021-10-25"),
    );

    expect(result).toEqual([item1]);
  });

  it("will return items on the upper bound of the date range", () => {
    const item1 = itemFactory({ dueDate: new Date("2021-10-25") });

    const result = filterByDateRange(
      [item1],
      new Date("2021-10-15"),
      new Date("2021-10-25"),
    );

    expect(result).toEqual([item1]);
  });
});

describe("filterForUrgentItems", () => {
  it("will return items that are overdue or due in the next 2 days", () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);
    const item1 = itemFactory({ dueDate: today });
    const item2 = itemFactory({ dueDate: tomorrow });
    const item3 = itemFactory({ dueDate: dayAfterTomorrow });

    const result = filterForUrgentItems([item1, item2, item3]);

    expect(result).toEqual([item1, item2]);
  });
});

describe("filterUpcomingItems", () => {
  it("will return items due after tomorrow", () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);
    const item1 = itemFactory({ dueDate: today });
    const item2 = itemFactory({ dueDate: tomorrow });
    const item3 = itemFactory({ dueDate: dayAfterTomorrow });

    const result = filterUpcomingItems([item1, item2, item3]);

    expect(result).toEqual([item3]);
  });
});
