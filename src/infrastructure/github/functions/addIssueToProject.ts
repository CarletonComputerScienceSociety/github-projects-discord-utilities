import logger from "@src/config/logger";
import axios from "axios";
import { Result, Err, Ok } from "ts-results";
import { ADD_PROJECT_V2_ITEM_BY_ID } from "../graphql";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.GITHUB_ACCESS_TOKEN ?? "";

export const addIssueToProject = async ({
  projectId,
  issueId,
}: {
  projectId: string;
  issueId: string;
}): Promise<Result<{ id: string }, Error>> => {
  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      {
        query: ADD_PROJECT_V2_ITEM_BY_ID,
        variables: {
          projectId,
          contentId: issueId,
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
        event: "github.addIssueToProject.error",
        body: response.data.errors
          .map((error: any) => error.message)
          .join(", "),
      });
      return Err(new Error("Failed to add issue to project"));
    }

    return Ok(response.data.data.addProjectV2ItemById.item);
  } catch (error) {
    logger.error({
      event: "github.addIssueToProject.error",
      body: error instanceof Error ? error.message : "Unknown error",
    });
    return Err(new Error("Failed to add issue to project"));
  }
};
