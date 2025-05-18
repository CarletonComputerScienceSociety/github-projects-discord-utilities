import { ItemService } from "@src/items/services";

// Define IDs
const discordId = "147881865548791808";
const githubId = "MDQ6VXNlcjQzMjIzNjgy";
const githubUsername = "MathyouMB";

// Manual mock of ItemService
jest.mock("@src/items/services", () => ({
  ItemService: {
    updateAssignee: jest.fn(),
  },
}));

// Use dynamic mocking for githubDiscordMapJson
beforeAll(() => {
  jest.doMock("../../../../data/githubDiscordMap.json", () => {
    return {
      [githubUsername]: {
        githubUsername,
        githubId,
        discordId,
      },
    };
  });
});

import { assigneeSelectInteraction } from "@infrastructure/discord/interactions/assigneeSelectInteraction";

describe("assigneeSelectInteraction", () => {
  const mockReply = jest.fn();
  const mockUpdate = jest.fn();

  const makeInteraction = (
    customId = "issue:assignee:select:issue-123",
    values = [discordId],
  ) => ({
    customId,
    values,
    reply: mockReply,
    update: mockUpdate,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("will throw an error for invalid customId format", async () => {
    const interaction = makeInteraction("invalid:format");

    await expect(() =>
      assigneeSelectInteraction(interaction as any),
    ).rejects.toThrow("Invalid customId format");
  });

  it("will show error if Discord ID is not found in GitHub map", async () => {
    const interaction = makeInteraction("issue:assignee:select:issue-789", [
      "not-in-map",
    ]);

    await assigneeSelectInteraction(interaction as any);

    expect(mockReply).toHaveBeenCalledWith({
      content: "❌ Unable to find linked GitHub account for selected user.",
      ephemeral: true,
    });
  });

  it("will show error if updateAssignee fails", async () => {
    const interaction = makeInteraction("issue:assignee:select:issue-001");

    (ItemService.updateAssignee as jest.Mock).mockResolvedValue({ err: true });

    await assigneeSelectInteraction(interaction as any);

    expect(ItemService.updateAssignee).toHaveBeenCalledWith({
      itemId: "issue-001",
      assigneeId: githubId,
    });

    expect(mockReply).toHaveBeenCalledWith({
      content:
        "❌ Failed to update assignee. Cannot assign to Draft Issues (yet).",
      ephemeral: true,
    });
  });

  it("will update message if assignee update succeeds", async () => {
    const interaction = makeInteraction("issue:assignee:select:issue-002");

    (ItemService.updateAssignee as jest.Mock).mockResolvedValue({ err: false });

    await assigneeSelectInteraction(interaction as any);

    expect(ItemService.updateAssignee).toHaveBeenCalledWith({
      itemId: "issue-002",
      assigneeId: githubId,
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      content: `**Assigned**: <@${discordId}>`,
      components: [],
    });
  });
});
