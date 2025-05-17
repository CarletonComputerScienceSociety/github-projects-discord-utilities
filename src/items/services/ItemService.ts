import { Result } from "ts-results";
import { GithubAPI } from "@infrastructure/github";
import {
  PROJECT_ID,
  DUE_DATE_FIELD_ID,
} from "@infrastructure/github/constants";

export const create = async ({
  title,
  description,
  dueDate,
}: {
  title: string;
  description: string;
  dueDate: Date;
}): Promise<Result<any, Error>> => {
  // TODO: it is worth considering how we should handle the case of when one of this operations fails...
  // For now, we will just return the error of the first operation that fails, but these will leave dangling issues
  // We should consider using background jobs to process the sequential operations or have jobs that retry the failed operations

  const result = await GithubAPI.createIssue({
    title,
    description,
    dueDate,
  });

  if (result.err) {
    return result;
  }

  const addItemResult = await GithubAPI.addIssueToProject({
    issueId: result.val.id,
    projectId: PROJECT_ID, // TODO: item service should not be aware of Github domain constant
  });

  if (addItemResult.err) {
    return addItemResult;
  }

  const updateDueDate = await GithubAPI.updateProjectItemDueDate({
    projectId: PROJECT_ID, // TODO: item service should not be aware of Github domain constant
    itemId: addItemResult.val.id,
    fieldId: DUE_DATE_FIELD_ID, // TODO: item service should not be aware of Github domain constant
    date: dueDate.toISOString(),
  });

  return updateDueDate;
};
