import logger from "@src/config/logger";
import { Item } from "@src/items";
import axios from "axios";
import { Result, Ok, Err } from "ts-results";
import { ProjectV2Item } from "..";
import { PROJECT_V2_ITEMS } from "../graphql";

export const fetchProjectItems = async (): Promise<Result<Item[], Error>> => {
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
        githubProjectItemId: item.id,
        githubIssueId: item.content.id,
        title: item.content.title,
        url: item.content.url,
        assignedUsers,
        labels,
        dueDate: dueDate,
        status: status,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
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
