import { describe, expect } from "@jest/globals";
import {
  filterByDateRange,
  filterByLabel,
  filterByStatus,
  filterForTwentyFourHours,
  filterForUnassigned,
  filterForUrgentItems,
  filterOutStatus,
  filterUpcomingItems,
  sortByDate,
} from "../../src/items";
import { itemFactory } from "./factories/item-factory";
import exp from "constants";

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

describe("filterForTwentyFourHours", () => {
  it("will return items that are overdue or due in the next 24 Hours", () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const item1 = itemFactory({ dueDate: today });
    const item2 = itemFactory({ dueDate: tomorrow });
    const item3 = itemFactory({ dueDate: dayAfterTomorrow });

    const result = filterForTwentyFourHours([item1, item2, item3]);
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

describe("filterByLabels", () => {
  it("will return items with any of the labels matching", () => {
    const item1 = itemFactory({ labels: [] });
    const item2 = itemFactory({ labels: ["social post"] });
    const item3 = itemFactory({ labels: ["social post", "not a label"] });
    const item4 = itemFactory({ labels: ["social post", "scs email"] });
    const item5 = itemFactory({ labels: ["scs email", "not a label"] });
    const item6 = itemFactory({ labels: ["not a label 1", "not a label 2"] });

    const result = filterByLabel(
      [item1, item2, item3, item4, item5, item6],
      ["social post", "scs email"],
    );

    expect(result).toEqual([item2, item3, item4, item5]);
  });
});

describe("orderByDate", () => {
  it("will sort the items by date", () => {
    const item1 = itemFactory({ dueDate: undefined });
    const item2 = itemFactory({ dueDate: undefined });
    const item3 = itemFactory({ dueDate: new Date("2024-06-29") });
    const item4 = itemFactory({ dueDate: new Date("2024-07-02") });
    const item5 = itemFactory({ dueDate: new Date("2024-07-05") });
    const item6 = itemFactory({ dueDate: new Date("2024-09-22") });
    const item7 = itemFactory({ dueDate: new Date("2024-09-22") });
    const item8 = itemFactory({ dueDate: new Date("2024-06-29") });

    const items = [item8, item4, item7, item2, item3, item6, item1, item5];
    const sortedItems = items.sort(sortByDate);

    expect(sortedItems).toEqual([
      item3,
      item8,
      item4,
      item5,
      item6,
      item7,
      item1,
      item2,
    ]);
  });
});
