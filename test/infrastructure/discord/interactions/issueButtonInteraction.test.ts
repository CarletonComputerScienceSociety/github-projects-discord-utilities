import { issueButtonInteraction } from "@infrastructure/discord/interactions/issueButtonInteraction";
import { promptAssigneeSelection } from "@infrastructure/discord/interactions/promptAssigneeSelection";

jest.mock(
  "@infrastructure/discord/interactions/promptAssigneeSelection",
  () => ({
    promptAssigneeSelection: jest.fn(),
  }),
);

describe("issueButtonInteraction", () => {
  const mockReply = jest.fn();

  const makeInteraction = (customId: string) =>
    ({
      isButton: () => true,
      customId,
      reply: mockReply,
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("will ignore non-button interactions", async () => {
    const interaction = {
      isButton: () => false,
    } as any;

    await issueButtonInteraction(interaction);
    expect(mockReply).not.toHaveBeenCalled();
  });

  it("will respond with error if githubIssueId is missing", async () => {
    const interaction = makeInteraction("issue:edit:");

    await issueButtonInteraction(interaction);

    expect(mockReply).toHaveBeenCalledWith({
      content: "⚠️ Invalid button ID.",
      ephemeral: true,
    });
  });

  it("will respond with edit message", async () => {
    const interaction = makeInteraction("issue:edit:abc-123");

    await issueButtonInteraction(interaction);

    expect(mockReply).toHaveBeenCalledWith({
      content: "✏️ Editing issue with ID `abc-123` (not yet implemented).",
      ephemeral: true,
    });
  });

  it("will call promptAssigneeSelection on assign", async () => {
    const interaction = makeInteraction("issue:assign:abc-123");

    await issueButtonInteraction(interaction);

    expect(promptAssigneeSelection).toHaveBeenCalledWith(
      interaction,
      "abc-123",
    );
  });

  it("will respond with delete message", async () => {
    const interaction = makeInteraction("issue:delete:abc-123");

    await issueButtonInteraction(interaction);

    expect(mockReply).toHaveBeenCalledWith({
      content: "🗑️ Deleting issue `abc-123` (not yet implemented).",
      ephemeral: true,
    });
  });

  it("will respond with unknown action", async () => {
    const interaction = makeInteraction("issue:unknown:abc-123");

    await issueButtonInteraction(interaction);

    expect(mockReply).toHaveBeenCalledWith({
      content: "❌ Unknown action: `unknown`",
      ephemeral: true,
    });
  });
});
