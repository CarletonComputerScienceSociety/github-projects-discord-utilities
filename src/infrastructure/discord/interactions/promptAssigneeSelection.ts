import { buildAssigneeSelectionRow } from "../builders";

// TODO: fix any type
export const promptAssigneeSelection = async (interaction: any) => {
  const assigneeSelectionRow = buildAssigneeSelectionRow();

  await interaction.reply({
    content: "Select an assignee for this issue:",
    components: [assigneeSelectionRow],
    ephemeral: true,
  });
};
