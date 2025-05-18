import logger from "@src/config/logger";
import axios from "axios";
import { Result, Err, Ok } from "ts-results";
import { UPDATE_PROJECT_V2_ITEM_DUE_DATE } from "../graphql";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.GITHUB_ACCESS_TOKEN ?? "";

export const updateProjectItemDueDate = async ({
  projectId,
  itemId,
  fieldId,
  date,
}: {
  projectId: string;
  itemId: string;
  fieldId: string;
  date: string; // e.g. "2025-06-01"
}): Promise<Result<{ id: string }, Error>> => {
  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      {
        query: UPDATE_PROJECT_V2_ITEM_DUE_DATE,
        variables: {
          projectId,
          itemId,
          fieldId,
          date,
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
        event: "github.updateProjectItemDueDate.error",
        body: response.data.errors
          .map((error: any) => error.message)
          .join(", "),
      });
      return Err(new Error("Failed to update due date"));
    }

    return Ok(response.data.data.updateProjectV2ItemFieldValue.projectV2Item);
  } catch (error) {
    logger.error({
      event: "github.updateProjectItemDueDate.error",
      body: error instanceof Error ? error.message : "Unknown error",
    });
    return Err(new Error("Failed to update due date"));
  }
};
