import { execute } from "@infrastructure/discord/commands/unassignedIssues";
import { GithubAPI } from "@infrastructure/github";
import { can } from "@infrastructure/discord/authz";
import { filterForUnassigned } from "@src/items";
import { buildIssueButtonRow } from "@infrastructure/discord/builders";
import { formatDiscordDate } from "@infrastructure/discord/webhookMessages";

jest.mock("@infrastructure/github", () => ({
  GithubAPI: {
    fetchProjectItems: jest.fn(),
  },
}));

jest.mock("@infrastructure/discord/authz", () => ({
  can: jest.fn(),
}));

jest.mock("@src/items", () => ({
  filterForUnassigned: jest.fn(),
}));

jest.mock("@infrastructure/discord/builders", () => ({
  buildIssueButtonRow: jest.fn(() => "[buttons]"),
}));

jest.mock("@infrastructure/discord/webhookMessages", () => ({
  formatDiscordDate: jest.fn((date) => `Formatted(${date})`),
}));

describe("unassigned-issues command", () => {
  const mockReply = jest.fn();
  const mockEditReply = jest.fn();
  const mockDeferReply = jest.fn();
  const mockFollowUp = jest.fn();

  const makeInteraction = (options = {}) => ({
    user: { id: "user-123" },
    options: {
      getString: jest.fn(() => "today"),
      getInteger: jest.fn(() => null),
      ...options,
    },
    reply: mockReply,
    deferReply: mockDeferReply,
    editReply: mockEditReply,
    followUp: mockFollowUp,
  });

  const defaultItem = (overrides = {}) => ({
    title: "Unassigned Issue",
    url: "https://github.com/test",
    githubIssueId: "456",
    assignedUsers: [],
    createdAt: new Date().toISOString(),
    dueDate: "2025-06-01",
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
      content: "You do not have permission to view issues.",
      ephemeral: true,
    });
  });

  it("will show error if GitHub API fails", async () => {
    (can as jest.Mock).mockReturnValue(true);
    (GithubAPI.fetchProjectItems as jest.Mock).mockResolvedValue({ err: true, val: { message: "fail" } });

    const interaction = makeInteraction();
    await execute(interaction as any);

    expect(mockEditReply).toHaveBeenCalledWith({
      content: expect.stringContaining("Failed to fetch issues"),
    });
  });

  it("will show message if no unassigned issues are found", async () => {
    (can as jest.Mock).mockReturnValue(true);
    (GithubAPI.fetchProjectItems as jest.Mock).mockResolvedValue({ err: false, val: [] });
    (filterForUnassigned as jest.Mock).mockReturnValue([]);

    const interaction = makeInteraction();
    await execute(interaction as any);

    expect(mockEditReply).toHaveBeenCalledWith({
      content: expect.stringContaining("No unassigned issues found"),
    });
  });

  it("will return a specific unassigned issue by index", async () => {
    (can as jest.Mock).mockReturnValue(true);
    (GithubAPI.fetchProjectItems as jest.Mock).mockResolvedValue({ err: false, val: [defaultItem()] });
    (filterForUnassigned as jest.Mock).mockReturnValue([defaultItem()]);

    const interaction = makeInteraction({ getInteger: () => 0 });
    await execute(interaction as any);

    expect(mockEditReply).toHaveBeenCalledWith({
      content: expect.stringContaining("**Issue #0**"),
      components: ["[buttons]"],
    });
  });

  it("will show an index list of unassigned issues when no index is provided", async () => {
    (can as jest.Mock).mockReturnValue(true);
    (GithubAPI.fetchProjectItems as jest.Mock).mockResolvedValue({ err: false, val: [defaultItem()] });
    (filterForUnassigned as jest.Mock).mockReturnValue([defaultItem()]);

    const interaction = makeInteraction();
    await execute(interaction as any);

    expect(mockEditReply).toHaveBeenCalledWith({
      content: expect.stringContaining("unassigned issue(s) found:\n\n\`0\`"),
    });
  });
});
