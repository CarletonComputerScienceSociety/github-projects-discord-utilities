import logger from "@src/config/logger";
import axios from "axios";
import { Result, Err, Ok } from "ts-results";
import { CREATE_ISSUE_WITH_PROJECT } from "../graphql";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.GITHUB_ACCESS_TOKEN ?? "";

const REPO_ID = "R_kgDOLyx0yw"; // hardcoded repository GraphQL ID
// const PROJECT_ID = "PVT_kwDOABL5c84Ag5Rq"; // hardcoded ProjectV2 ID
export const createIssue = async ({
  title,
  description,
  dueDate,
}: {
  title: string;
  description: string;
  dueDate: Date;
}): Promise<Result<any, Error>> => {
  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      {
        query: CREATE_ISSUE_WITH_PROJECT,
        variables: {
          repositoryId: REPO_ID,
          title,
          body: description,
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
        event: "github.createIssue.error",
        body: response.data.errors
          .map((error: any) => error.message)
          .join(", "),
      });
      return Err(new Error("Failed to create issue"));
    }

    return Ok(response.data.data.createIssue.issue);
  } catch (error) {
    logger.error({
      event: "github.createIssue.error",
      body: error instanceof Error ? error.message : "Unknown error",
    });
    return Err(new Error("Failed to create issue"));
  }
};
