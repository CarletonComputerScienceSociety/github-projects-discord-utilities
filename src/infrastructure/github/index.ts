import axios from "axios";
import { Ok, Err, Result } from "ts-results";
import dotenv from "dotenv";
import { CREATE_ISSUE_WITH_PROJECT, PROJECT_V2_ITEMS } from "./graphql";
import { Item } from "../../items";
import logger from "@config/logger";

dotenv.config();

// TODO: improve this
export interface ProjectV2Item {
  id: string;
  content: {
    title: string;
    url: string;
  };
  fieldValueByName: {
    id: string;
    date: string;
  };
  fieldValues: {
    nodes: {
      id: string;
      date: string;
      users: {
        nodes: {
          id: string;
          url: string;
        }[];
      };
      labels: {
        nodes: {
          name: string;
        }[];
      };
      name: string;
    }[];
  };
}

export const fetchProjectV2Items = async (): Promise<Result<Item[], Error>> => {
  const result = await fetchData();
  if (result.err) {
    return result;
  }

  const formattedItems = convertGithubItems(
    result.val.data.organization.projectV2.items.nodes,
  );
  return Ok(formattedItems);
};

const TOKEN = process.env.GITHUB_ACCESS_TOKEN ?? "";

const fetchData = async (): Promise<Result<any, Error>> => {
  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      {
        query: PROJECT_V2_ITEMS,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      },
    );
    return Ok(response.data);
  } catch (error) {
    logger.error({
      event: "github.fetchProjectV2Items.error",
      body: error instanceof Error ? error.message : "Failed to fetch data",
    });
    return Err(new Error("Failed to fetch data"));
  }
};

const convertGithubItems = (items: ProjectV2Item[]) => {
  return items
    .map((item: ProjectV2Item) => {
      const assignedUsers = item.fieldValues.nodes
        .filter((field) => field.users)
        .flatMap((field) => field.users.nodes.map((user) => user.url));
      const status = item.fieldValues.nodes
        .filter((field) => field.name)
        .map((field) => field.name)[0];
      const labels = item.fieldValues.nodes
        .filter((field) => field.labels)
        .flatMap((field) => field.labels.nodes.map((label) => label.name));

      // TODO: improve this
      let dueDate: Date | undefined;
      if (item.fieldValueByName?.date) {
        dueDate = new Date(item.fieldValueByName.date);
        dueDate.setDate(dueDate.getDate() + 1);
      }

      return {
        title: item.content.title,
        url: item.content.url,
        assignedUsers,
        labels,
        dueDate: dueDate,
        status: status,
      };
    })
    .sort(sortByDate);
};

const sortByDate = (item1: Item, item2: Item): number => {
  if (item1.dueDate === undefined && item2.dueDate === undefined) return 0;
  if (item1.dueDate === undefined) return 1;
  if (item2.dueDate === undefined) return -1;
  if (item1.dueDate === item2.dueDate) return 0;
  return item1.dueDate < item2.dueDate ? -1 : 1;
};
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
        body: response.data.errors.map((error: any) => error.message).join(", "),
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
