import { ItemService } from "@src/items/services";
import { Ok, Err } from "ts-results";
import {
  execute,
  handleModalSubmit,
} from "@infrastructure/discord/commands/createIssue";
import { promptAssigneeSelection } from "@infrastructure/discord/interactions";
import { can } from "@infrastructure/discord/authz";
import { CommandInteraction, ModalSubmitInteraction } from "discord.js";

jest.mock("@src/items/services", () => ({
  ItemService: {
    create: jest.fn(),
  },
}));

jest.mock("@infrastructure/discord/interactions", () => ({
  promptAssigneeSelection: jest.fn(),
}));

jest.mock("@infrastructure/discord/authz", () => ({
  can: jest.fn(),
}));

const mockShowModal = jest.fn();
const mockReply = jest.fn();

describe("create-issue slash command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("will block unauthorized users", async () => {
      (can as jest.Mock).mockReturnValue(false);

      const interaction = {
        user: { id: "unauthorized" },
        reply: mockReply,
      } as unknown as CommandInteraction;

      await execute(interaction);

      expect(mockReply).toHaveBeenCalledWith({
        content: "You do not have permission to create an issue.",
        ephemeral: true,
      });
    });

    it("will show modal for authorized users", async () => {
      (can as jest.Mock).mockReturnValue(true);

      const interaction = {
        user: { id: "authorized" },
        showModal: mockShowModal,
        reply: mockReply,
      } as unknown as CommandInteraction;

      await execute(interaction);

      expect(mockShowModal).toHaveBeenCalled();
    });
  });

  describe("handleModalSubmit", () => {
    const interaction = {
      fields: {
        getTextInputValue: jest.fn(),
      },
      reply: mockReply,
    } as unknown as ModalSubmitInteraction;

    it("will reject invalid due date format", async () => {
      interaction.fields.getTextInputValue = jest.fn((key) =>
        key === "dueDate" ? "bad-date" : "test value",
      );

      await expect(() => handleModalSubmit(interaction)).rejects.toThrow(
        "Invalid due date format. Please use yyyy-mm-dd.",
      );
    });

    it("will handle error from ItemService.create", async () => {
      interaction.fields.getTextInputValue = jest.fn((key) => {
        if (key === "dueDate") return "2025-05-17";
        return "test value";
      });

      (ItemService.create as jest.Mock).mockResolvedValue(
        Err(new Error("creation failed")),
      );

      await handleModalSubmit(interaction);

      expect(ItemService.create).toHaveBeenCalledWith({
        title: "test value",
        description: "test value",
        dueDate: new Date("2025-05-17"),
      });

      expect(mockReply).toHaveBeenCalledWith({
        content: "Failed to create issue. Please try again.",
        ephemeral: true,
      });
    });

    it("will call promptAssigneeSelection on success", async () => {
      interaction.fields.getTextInputValue = jest.fn((key) => {
        if (key === "dueDate") return "2025-05-17";
        return "test value";
      });

      (ItemService.create as jest.Mock).mockResolvedValue(
        Ok({ githubIssueId: "abc-123" }),
      );

      await handleModalSubmit(interaction);

      expect(promptAssigneeSelection).toHaveBeenCalledWith(
        interaction,
        "abc-123",
      );
    });
  });
});
