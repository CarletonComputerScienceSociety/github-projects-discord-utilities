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

export * as GithubAPI from "./functions";
