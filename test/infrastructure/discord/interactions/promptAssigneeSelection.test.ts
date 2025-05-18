import { promptAssigneeSelection } from "@infrastructure/discord/interactions/promptAssigneeSelection";
import { buildAssigneeSelectionRow } from "@infrastructure/discord/builders";

jest.mock("@infrastructure/discord/builders", () => ({
  buildAssigneeSelectionRow: jest.fn(),
}));

describe("promptAssigneeSelection", () => {
  const mockReply = jest.fn();
  const mockInteraction = {
    reply: mockReply,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("will reply with an assignee selection row", async () => {
    const githubIssueId = "abc-123";
    const fakeRow = { type: "fake-row" };

    (buildAssigneeSelectionRow as jest.Mock).mockReturnValue(fakeRow);

    await promptAssigneeSelection(mockInteraction as any, githubIssueId);

    expect(buildAssigneeSelectionRow).toHaveBeenCalledWith(githubIssueId);

    expect(mockReply).toHaveBeenCalledWith({
      content: "Select an assignee for this issue:",
      components: [fakeRow],
      ephemeral: true,
    });
  });
});
