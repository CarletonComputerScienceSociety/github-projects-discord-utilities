import logger from "@src/config/logger";
import axios from "axios";
import { Result, Err, Ok } from "ts-results";
import { UPDATE_ISSUE_ASSIGNEE } from "../graphql";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.GITHUB_ACCESS_TOKEN ?? "";

export const updateProjectItemAssignee = async ({
  issueId,
  assigneeId,
}: {
  issueId: string;
  assigneeId: string;
}): Promise<Result<{ id: string }, Error>> => {
  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      {
        query: UPDATE_ISSUE_ASSIGNEE,
        variables: {
          issueId: issueId,
          assigneeIds: [assigneeId],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      },
    );

    if (response.data.errors) {
      logger.error({
        event: "github.updateProjectItemAssignee.error",
        body: response.data.errors
          .map((error: any) => error.message)
          .join(", "),
      });
      return Err(new Error("Failed to update assignee"));
    }

    return Ok(response.data.data.updateIssue);
  } catch (error) {
    logger.error({
      event: "github.updateProjectItemAssignee.error",
      body: error instanceof Error ? error.message : "Unknown error",
    });
    return Err(new Error("Failed to update assignee"));
  }
};
