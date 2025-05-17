import { Result } from "ts-results";
import { GithubAPI } from "@infrastructure/github";

export const create = async ({
  title,
  description,
  dueDate,
}: {
  title: string;
  description: string;
  dueDate: Date;
}): Promise<Result<any, Error>> => {
  const result = await GithubAPI.createIssue({
    title,
    description,
    dueDate,
  });

  return result;
};
