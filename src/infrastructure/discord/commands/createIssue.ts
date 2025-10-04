import {
  SlashCommandBuilder,
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import { ModalSubmitInteraction } from "discord.js";
import { ItemService } from "@src/items/services";
import { can } from "../authz";
import { promptAssigneeSelection } from "../interactions";

export const data = new SlashCommandBuilder()
  .setName("create-issue")
  .setDescription(
    "Create a new issue with title, description, due date, and assignee",
  );

export async function execute(interaction: CommandInteraction) {
  if (!can(interaction.user.id, ["githubIssue:write"])) {
    await interaction.reply({
      content: "You do not have permission to create an issue.",
      ephemeral: true,
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId("create-issue:modal")
    .setTitle("Create New Issue");

  const titleInput = new TextInputBuilder()
    .setCustomId("title")
    .setLabel("Title")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const descriptionInput = new TextInputBuilder()
    .setCustomId("description")
    .setLabel("Description (Markdown supported)")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  const dueDateInput = new TextInputBuilder()
    .setCustomId("dueDate")
    .setLabel("Due Date (yyyy-mm-dd, defaults in 1 week)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    titleInput,
  );
  const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    descriptionInput,
  );
  const thirdRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    dueDateInput,
  );

  modal.addComponents(firstRow, secondRow, thirdRow);

  await interaction.showModal(modal);
}

export async function handleModalSubmit(
  interaction: ModalSubmitInteraction,
): Promise<void> {
  const title = interaction.fields.getTextInputValue("title");
  const description = interaction.fields.getTextInputValue("description");
  const dueDateInput = interaction.fields.getTextInputValue("dueDate");

  let dueDate: Date;

  if (dueDateInput) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDateInput)) {
      throw new Error("Invalid due date format. Please use yyyy-mm-dd.");
    }
    dueDate = new Date(dueDateInput);
  } else {
    dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // one week from today
  }

  const result = await ItemService.create({
    title,
    description,
    dueDate,
  });

  if (result.err) {
    await interaction.reply({
      content: "Failed to create issue. Please try again.",
      ephemeral: true,
    });
    return;
  }

  await promptAssigneeSelection(interaction, result.val.githubIssueId);
}
