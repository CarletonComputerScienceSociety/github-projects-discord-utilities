import { GithubAPI } from "@infrastructure/github";
import { can } from "@infrastructure/discord/authz";
import { buildIssueButtonRow } from "@infrastructure/discord/builders";
import { formatDiscordDate } from "@infrastructure/discord/webhookMessages";
import { UserService } from "@src/items/services/UserService";
import { execute } from "@infrastructure/discord/commands/myIssues";

// Mocks
jest.mock("@infrastructure/github", () => ({
  GithubAPI: {
    fetchProjectItems: jest.fn(),
  },
}));

jest.mock("@infrastructure/discord/authz", () => ({
  can: jest.fn(),
}));

jest.mock("@infrastructure/discord/builders", () => ({
  buildIssueButtonRow: jest.fn(() => "[buttons]"),
}));

jest.mock("@infrastructure/discord/webhookMessages", () => ({
  formatDiscordDate: jest.fn((date) => `Formatted(${date})`),
}));

jest.mock("@src/items/services/UserService", () => ({
  UserService: {
    findUserByDiscordID: jest.fn(),
  },
}));

describe("my-issues command", () => {
  const mockReply = jest.fn();
  const mockEditReply = jest.fn();
  const mockDeferReply = jest.fn();
  const mockFollowUp = jest.fn();

  const makeInteraction = (options = {}) => ({
    user: { id: "user-123" },
    options: { getInteger: jest.fn(() => null), ...options },
    reply: mockReply,
    deferReply: mockDeferReply,
    editReply: mockEditReply,
    followUp: mockFollowUp,
  });

  const defaultItem = (overrides = {}) => ({
    title: "Issue Title",
    url: "https://github.com/test",
    githubIssueId: "123",
    assignedUsers: ["https://github.com/test-user"],
    createdAt: new Date().toISOString(),
    dueDate: "2025-05-20",
    status: "Open",
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("will block unauthorized users", async () => {
    (can as jest.Mock).mockReturnValue(false);
    const interaction = makeInteraction();

    await execute(interaction as any);

    expect(mockReply).toHaveBeenCalledWith({
      content: "You do not have permission to create an issue.",
      ephemeral: true,
    });
  });

  it("will show error if user is not linked to a GitHub account", async () => {
    (can as jest.Mock).mockReturnValue(true);
    (UserService.findUserByDiscordID as jest.Mock).mockResolvedValue({
      err: true,
    });

    const interaction = makeInteraction();
    await execute(interaction as any);

    expect(mockReply).toHaveBeenCalledWith({
      content: expect.stringContaining("linked to a GitHub account"),
      ephemeral: true,
    });
  });

  it("will show error if GitHub API fails", async () => {
    (can as jest.Mock).mockReturnValue(true);
    (UserService.findUserByDiscordID as jest.Mock).mockResolvedValue({
      ok: true,
      val: { githubUsername: "test-user" },
    });
    (GithubAPI.fetchProjectItems as jest.Mock).mockResolvedValue({
      err: true,
      val: { message: "Boom" },
    });

    const interaction = makeInteraction();

    await execute(interaction as any);

    expect(mockEditReply).toHaveBeenCalledWith({
      content: expect.stringContaining("Failed to fetch issues"),
    });
  });

  it("will show message if no assigned issues are found", async () => {
    (can as jest.Mock).mockReturnValue(true);
    (UserService.findUserByDiscordID as jest.Mock).mockResolvedValue({
      ok: true,
      val: { githubUsername: "test-user" },
    });
    (GithubAPI.fetchProjectItems as jest.Mock).mockResolvedValue({
      err: false,
      val: [],
    });

    const interaction = makeInteraction();

    await execute(interaction as any);

    expect(mockEditReply).toHaveBeenCalledWith({
      content: expect.stringContaining("no assigned issues"),
    });
  });

  it("will show a specific issue by index", async () => {
    (can as jest.Mock).mockReturnValue(true);
    (UserService.findUserByDiscordID as jest.Mock).mockResolvedValue({
      ok: true,
      val: { githubUsername: "test-user" },
    });
    (GithubAPI.fetchProjectItems as jest.Mock).mockResolvedValue({
      err: false,
      val: [defaultItem({ assignedUsers: ["https://github.com/test-user"] })],
    });

    const interaction = makeInteraction({ getInteger: () => 0 });

    await execute(interaction as any);

    expect(mockEditReply).toHaveBeenCalledWith({
      content: expect.stringContaining("**Issue #0**"),
      components: ["[buttons]"],
    });
  });

  it("will show index list when no index is provided", async () => {
    (can as jest.Mock).mockReturnValue(true);
    (UserService.findUserByDiscordID as jest.Mock).mockResolvedValue({
      ok: true,
      val: { githubUsername: "test-user" },
    });
    (GithubAPI.fetchProjectItems as jest.Mock).mockResolvedValue({
      err: false,
      val: [defaultItem({ assignedUsers: ["https://github.com/test-user"] })],
    });

    const interaction = makeInteraction();

    await execute(interaction as any);

    expect(mockEditReply).toHaveBeenCalledWith({
      content: expect.stringContaining("assigned issue(s):\n\n`0`"),
    });
  });
});
