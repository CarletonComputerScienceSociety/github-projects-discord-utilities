import { ProjectV2Item } from "../github";

export interface Item {
  title: string;
  status: string;
  assignedUsers: string[];
  labels?: string[];
  dueDate?: Date;
  url?: string;
}

export const convertGithubItems = (items: ProjectV2Item[]): Item[] => {
  return items
    .map((item: ProjectV2Item) => {
      const assignedUsers = item.fieldValues.nodes
        .filter((field) => field.users)
        .flatMap((field) => field.users.nodes.map((user) => user.url));
      const status = item.fieldValues.nodes
        .filter((field) => field.name)
        .map((field) => field.name)[0];
      const labels = item.fieldValues.nodes
        .filter((field) => field.labels)
        .flatMap((field) => field.labels.nodes.map((label) => label.name));

      // TODO: improve this
      let dueDate: Date | undefined;
      if (item.fieldValueByName?.date) {
        dueDate = new Date(item.fieldValueByName.date);
        dueDate.setDate(dueDate.getDate() + 1);
      }

      return {
        title: item.content.title,
        url: item.content.url,
        assignedUsers,
        labels,
        dueDate: dueDate,
        status: status,
      };
    })
    .sort(sortByDate);
};

export const sortByDate = (item1: Item, item2: Item): number => {
  if (item1.dueDate === undefined && item2.dueDate === undefined) return 0;
  if (item1.dueDate === undefined) return 1;
  if (item2.dueDate === undefined) return -1;
  if (item1.dueDate === item2.dueDate) return 0;
  return item1.dueDate < item2.dueDate ? -1 : 1;
};

export const filterByDateRange = (
  items: Item[],
  startDate: Date,
  endDate: Date,
) => {
  return items.filter((item) => {
    if (!item.dueDate) {
      return false;
    }

    return item.dueDate >= startDate && item.dueDate <= endDate;
  });
};

// urgent items are due tomorrow or earlier
export const filterForUrgentItems = (items: Item[]) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);

  return items.filter((item) => {
    if (!item.dueDate) {
      return false;
    }
    return (
      item.dueDate <= tomorrow &&
      item.status !== "Done" &&
      item.assignedUsers.length !== 0
    );
  });
};

//for reminders ran at 8:30pm (midnight in UTC) checking the next 24 hours will pull up tasks
//due the next day
export const filterForTwentyFourHours = (items: Item[]) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return items.filter((item) => {
    if (!item.dueDate) {
      return false;
    }
    return item.dueDate <= tomorrow && item.status !== "Done";
  });
};

export const filterUpcomingItems = (items: Item[]) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);

  return items.filter((item) => {
    if (!item.dueDate) {
      return false;
    }
    return (
      item.dueDate > tomorrow &&
      item.status !== "Done" &&
      item.assignedUsers.length !== 0
    );
  });
};

export const filterByStatus = (items: Item[], status: string) => {
  return items.filter((item) => item.status === status);
};

export const filterOutStatus = (items: Item[], status: string) => {
  return items.filter((item) => item.status !== status);
};

export const filterForUnassigned = (items: Item[]) => {
  return items.filter((item) => item.assignedUsers.length === 0);
};

export const filterByLabel = (items: Item[], labels: string[]) => {
  return items.filter((item) =>
    labels.some((label) => item.labels?.includes(label)),
  );
};
