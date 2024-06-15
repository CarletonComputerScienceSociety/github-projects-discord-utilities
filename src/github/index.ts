import axios from "axios";
import { Ok, Err, Result } from "ts-results";
import { PROJECT_V2_ITEMS } from "./graphql";

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
      name: string;
    }[];
  };
}

export const fetchProjectV2Items = async (): Promise<
  Result<ProjectV2Item[], Error>
> => {
  const result = await fetchData();
  if (result.err) {
    return result;
  }

  return Ok(result.val.data.organization.projectV2.items.nodes);
};

// TODO: move to .env (it's fine for now because it only has read access)
const TOKEN =
  "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";

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
    return Err(new Error("Failed to fetch data"));
  }
};
