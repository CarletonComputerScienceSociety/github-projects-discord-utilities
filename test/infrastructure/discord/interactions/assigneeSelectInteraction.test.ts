import { ItemService } from "@src/items/services";
import { assigneeSelectInteraction } from "@infrastructure/discord/interactions/assigneeSelectInteraction";
import { UserService } from "@src/items/services/UserService";

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

// Manual mock of UserService
jest.mock("@src/items/services/UserService", () => ({
  UserService: {
    findUserByDiscordID: jest.fn(),
  },
}));

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

    (UserService.findUserByDiscordID as jest.Mock).mockResolvedValue({
      err: true,
    });

    await assigneeSelectInteraction(interaction as any);

    expect(mockReply).toHaveBeenCalledWith({
      content: "❌ Unable to find linked GitHub account for selected user.",
      ephemeral: true,
    });
  });

  it("will show error if updateAssignee fails", async () => {
    const interaction = makeInteraction("issue:assignee:select:issue-001");

    (UserService.findUserByDiscordID as jest.Mock).mockResolvedValue({
      ok: true,
      val: {
        githubUsername,
        githubId,
        discordId,
      },
    });

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

    (UserService.findUserByDiscordID as jest.Mock).mockResolvedValue({
      ok: true,
      val: {
        githubUsername,
        githubId,
        discordId,
      },
    });

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
