import { Item } from "../../../src/items";

export const itemFactory = ({
  title,
  status,
  assignedUsers,
  dueDate,
  url,
}: {
  title?: string;
  status?: string;
  assignedUsers?: string[];
  dueDate?: Date;
  url?: string;
} = {}): Item => {
  return {
    title: title ?? "title",
    status: status ?? "status",
    assignedUsers: assignedUsers ?? ["https://github.com/MathyouMB"],
    dueDate: dueDate ?? undefined,
    url: url ?? "https://github.com/MathyouMB",
  };
};
