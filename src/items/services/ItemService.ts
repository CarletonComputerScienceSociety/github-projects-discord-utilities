import { Result } from "ts-results";
import { createIssue } from "@infrastructure/github";

export const createItem = async ({
  title,
  description,
  dueDate,
}: {
  title: string;
  description: string;
  dueDate: Date;
}): Promise<Result<any, Error>> => {
  const result = await createIssue({
    title,
    description,
    dueDate,
  });
  return result;
};
