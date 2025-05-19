import { urgentItemsDirectMessage } from "@infrastructure/discord/tasks/urgentItemsDirectMessage";
import { GithubAPI } from "@infrastructure/github";

jest.mock("@infrastructure/github", () => ({
  GithubAPI: {
    fetchProjectItems: jest.fn(),
  },
}));

jest.mock("@infrastructure/discord/webhookMessages", () => ({
  formatDiscordDate: jest.fn((date) => date.toISOString().split("T")[0]),
}));

jest.mock(
  "../../../../data/githubDiscordMap.json",
  () => ({
    MathyouMB: {
      githubUsername: "MathyouMB",
      githubId: "mock-github-id",
      discordId: "147881865548791808",
    },
  }),
  { virtual: true },
);

describe("urgentItemsDirectMessage", () => {
  let mockSend: jest.Mock;
  let mockClient: any;

  beforeEach(() => {
    jest.resetModules();
    mockSend = jest.fn();
    mockClient = {
      users: {
        fetch: jest.fn().mockResolvedValue({ tag: "TestUser", send: mockSend }),
      },
    };
  });

  it("will send a DM to mapped user with urgent issues", async () => {
    (GithubAPI.fetchProjectItems as jest.Mock).mockResolvedValue({
      err: false,
      val: [
        {
          title: "Fix bug",
          assignedUsers: ["https://github.com/MathyouMB"],
          dueDate: new Date("2025-05-20"),
          url: "https://github.com/test/test/issues/1",
          status: "In Progress",
        },
      ],
    });

    await urgentItemsDirectMessage(mockClient);

    expect(mockClient.users.fetch).toHaveBeenCalledWith("147881865548791808");
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining("Fix bug"));
  });

  it("will return early when GitHub fetch fails", async () => {
    (GithubAPI.fetchProjectItems as jest.Mock).mockResolvedValue({
      err: true,
      val: { message: "GitHub error" },
    });

    await urgentItemsDirectMessage(mockClient);

    expect(mockClient.users.fetch).not.toHaveBeenCalled();
  });

  it("will skip unmapped GitHub usernames", async () => {
    (GithubAPI.fetchProjectItems as jest.Mock).mockResolvedValue({
      err: false,
      val: [
        {
          title: "Unknown user task",
          assignedUsers: ["https://github.com/UnknownUser"],
          dueDate: new Date("2025-05-21"),
        },
      ],
    });

    await urgentItemsDirectMessage(mockClient);

    expect(mockSend).not.toHaveBeenCalled();
  });
});
