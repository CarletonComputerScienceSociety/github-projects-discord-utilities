import cron from "node-cron";
import axios from "axios";

// cron.schedule("*/1 * * * * *", async () => {
//   const data = await fetchData();
//   console.log(data)
//   const dueItems = itemsThatAreDue(data);
//   console.log(dueItems);
//   console.log(data);
//   console.log("running every 10 seconds");
// });

interface Item {
  title: string;
  status: string;
  assignedUsers: string[];
  dueDate?: Date;
  url?: string;
}

const formatItems = (items: any) => {
  return items.map((item: any) => {
    const assignedUsers = item.fieldValues.nodes
      .filter((field: any) => field.users)
      .flatMap((field: any) => field.users.nodes.map((user: any) => user.url));
    const status = item.fieldValues.nodes
      .filter((field: any) => field.name)
      .map((field: any) => field.name)[0];

    let dueDate: Date | undefined;
    if (item.fieldValueByName?.date) {
      dueDate = new Date(item.fieldValueByName.date);
      dueDate.setDate(dueDate.getDate() + 1);
    }

    return {
      title: item.content.title,
      url: item.content.url,
      assignedUsers,
      dueDate: dueDate,
      status: status,
    };
  });
};

const itemsThatAreDue = (data: any) => {
  const items = data.data.organization.projectV2.items.nodes;

  const dueToday = items.filter((item: any) => {
    if (!item.fieldValueByName) {
      return false;
    }

    const dueDate = new Date(item.fieldValueByName.date);
    const currentDate = new Date();
    const estDate = currentDate.toLocaleDateString("en-US", {
      timeZone: "America/New_York",
    });
    const [month, day, year] = estDate.split("/");
    const formattedDate = `${year}-${month}-${day}`;
    const currentDateReduced = new Date(formattedDate);

    return dueDate <= currentDateReduced;
  });

  const dueThisWeek = items.filter((item: any) => {
    if (!item.fieldValueByName) {
      return false;
    }
    const dueDate = new Date(item.fieldValueByName.date);
    const currentDate = new Date();
    const estDate = currentDate.toLocaleDateString("en-US", {
      timeZone: "America/New_York",
    });
    const [month, day, year] = estDate.split("/");
    const formattedDate = `${year}-${month}-${day}`;
    const currentDateReduced = new Date(formattedDate);
    const sixDaysFromNow = new Date(formattedDate);
    sixDaysFromNow.setDate(currentDateReduced.getDate() + 6);

    const hasUsersField = item.fieldValues.nodes.some( (field: any) => field.users);
    return (dueDate <= sixDaysFromNow && dueDate >= currentDateReduced) && hasUsersField;
  });

  const unassignTodos = items.filter((item: any) => {
    const hasUsersField = item.fieldValues.nodes.some( (field: any) => field.users);
    return !hasUsersField;
  });

  const formattedDueToday = formatItems(dueToday);
  const formattedDueThisWeek = formatItems(dueThisWeek);
  const formattedUnassignTodos = formatItems(unassignTodos || []);

  const filteredDueToday = formattedDueToday.filter(
    (item: Item) => item.status !== "Done",
  );

  const filteredDueThisWeek = formattedDueThisWeek.filter(
    (item: Item) =>
      item.status === "In Progress" ||
      item.status === "Review" ||
      item.status === "Todo",
  );

  const filteredUnassignTodos = formattedUnassignTodos.filter(
    (item: Item) =>
      item.status === "Todo",
  );

  return {
    dueToday: filteredDueToday,
    upcoming: filteredDueThisWeek,
    unassigned: filteredUnassignTodos,
  };
};

const GRAPHQL = `
{
  organization(login: "CarletonComputerScienceSociety"){
      projectV2(number: 18) {
				items(first: 100) {
				nodes {
					id
					content {
						... on DraftIssue {
							title
						}
						... on Issue {
							title
              url
						}
					}
					fieldValueByName(name: "Due") {
						... on ProjectV2ItemFieldDateValue {
							id
							date
						}
					}
					fieldValues(first: 10){
						nodes {
							... on ProjectV2ItemFieldDateValue {
							id
							date
							}
							... on ProjectV2ItemFieldUserValue {
								users(first: 5) {
									nodes {
										id
										url
									}
								}
							}
              ... on ProjectV2ItemFieldSingleSelectValue {
								id
							  name
							}
						}
					}
				}
				pageInfo {
					hasNextPage
					endCursor
				}
			}
		}
  }
}
`;

const TOKEN =
  "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";

const fetchData = async () => {
  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      {
        query: GRAPHQL,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
  }
};

const formatDiscordDate = (date: Date) => {
  return `<t:${Math.floor(date.getTime() / 1000)}>`;
};

const GITHUB_TO_DISCORD: { [key: string]: string } = {
  AJaccP: "693093284998021141",
  exkellybur: "398923451311587338",
  JohnLu2004: "358054341179080704",
  MathyouMB: "147881865548791808",
  MrRibcage: "142782738615762944",
  rebeccakempe12: "730876980861599744",
  "richard-dh-kim": "241421629543022592",
  ryangchung: "365948481946517504",
  VictorLi5611: "247472197902270465",
  VMordvinova: "759902786107473932",
};

const formatDiscordAssignees = (assignees: string[]) => {
  return assignees
    .map((assignee) => {
      const discordId =
        GITHUB_TO_DISCORD[assignee.replace("https://github.com/", "")];
      if (discordId) {
        return `<@${discordId}>`;
      } else {
        return assignee;
      }
    })
    .join(", ");
};

const formatTask = (item: Item) => {
  return item.dueDate ? `- ${item.title}: ${formatDiscordAssignees(item.assignedUsers)} - ${formatDiscordDate(item.dueDate)} - ${item.status}` : `- ${item.title}: ${formatDiscordAssignees(item.assignedUsers)} - ${item.status}`;
};

const sendDiscordMessage = async (dueToday: Item[], upcoming: Item[], unassigned: Item[]) => {
  const webhookUrl =
    "https://discord.com/api/webhooks/1251302978720239726/UgldsmHJfbdpZ9cLDeeGXEI34FsQU4RPAh7tMqccWYsTv-mXPK13wwAiM-lqfveHN4nM";

  const messageHeader =
    "# Upcoming Tasks - 🎉 \n Checkout all upcoming tasks [here.](https://github.com/orgs/CarletonComputerScienceSociety/projects/18)";
  const dueTodayHeader = "\n### 🔥 Today / Overdue: \n";
  const upcomingHeader = "\n### 📅 Assigned: \n";
  const unassignedHeader = "\n### 📥 Unassigned: \n";

  const dueTodayMessage = dueToday.map((item) => formatTask(item)).join("\n");
  const upcomingMessage = upcoming.map((item) => formatTask(item)).join("\n");
  const unassignedMessage = unassigned.map((item) => formatTask(item)).join("\n");

  const dueTodayFull = dueToday.length > 0 ? `${dueTodayHeader} ${dueTodayMessage}` : "";
  const upcomingFull = upcoming.length > 0 ? `${upcomingHeader} ${upcomingMessage}` : "";
  const unassignedFull = unassigned.length > 0 ? `${unassignedHeader} ${unassignedMessage}` : "";

  try {
    const response = await axios.post(webhookUrl, {
      content: `${messageHeader} ${dueTodayFull} ${upcomingFull} ${unassignedFull}`,
    });
    console.log(response.data);
  } catch (error) {
    console.error("Error:", error);
  }
};

const process = async () => {
  const data = await fetchData();
  const { dueToday, upcoming, unassigned } = itemsThatAreDue(data);
  sendDiscordMessage(dueToday, upcoming, unassigned);
};

process();
