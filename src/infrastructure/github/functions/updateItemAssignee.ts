import logger from "@src/config/logger";
import axios from "axios";
import { Result, Err, Ok } from "ts-results";
import { UPDATE_PROJECT_V2_ITEM_ASSIGNEE } from "../graphql";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.GITHUB_ACCESS_TOKEN ?? "";

export const updateProjectItemAssignee = async ({
  projectId,
  itemId,
  fieldId,
  assigneeId,
}: {
  projectId: string;
  itemId: string;
  fieldId: string;
  assigneeId: string;
}): Promise<Result<{ id: string }, Error>> => {
  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      {
        query: UPDATE_PROJECT_V2_ITEM_ASSIGNEE,
        variables: {
          projectId,
          itemId,
          fieldId,
          assigneeId,
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

    return Ok(response.data.data.updateProjectV2ItemFieldValue.projectV2Item);
  } catch (error) {
    logger.error({
      event: "github.updateProjectItemAssignee.error",
      body: error instanceof Error ? error.message : "Unknown error",
    });
    return Err(new Error("Failed to update assignee"));
  }
};
