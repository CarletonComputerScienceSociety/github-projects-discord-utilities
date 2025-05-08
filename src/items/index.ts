export interface Item {
  title: string;
  status: string;
  assignedUsers: string[];
  labels?: string[];
  dueDate?: Date;
  url?: string;
}

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

// for reminders ran at 8:30pm (midnight in UTC) checking the next 24 hours will pull up tasks
// due the next day
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
