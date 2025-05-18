import { CacheType, Interaction } from "discord.js";
import { promptAssigneeSelection } from "./promptAssigneeSelection";

export async function issueButtonInteraction(
  interaction: Interaction<CacheType>,
) {
  if (!interaction.isButton()) return;

  const [_issue, action, githubIssueId] = interaction.customId.split(":");

  if (!githubIssueId) {
    await interaction.reply({
      content: "⚠️ Invalid button ID.",
      ephemeral: true,
    });
    return;
  }

  switch (action) {
    case "edit":
      await interaction.reply({
        content: `✏️ Editing issue with ID \`${githubIssueId}\` (not yet implemented).`,
        ephemeral: true,
      });
      break;

    case "assign":
      await promptAssigneeSelection(interaction, githubIssueId);
      break;

    case "delete":
      await interaction.reply({
        content: `🗑️ Deleting issue \`${githubIssueId}\` (not yet implemented).`,
        ephemeral: true,
      });
      break;

    default:
      await interaction.reply({
        content: `❌ Unknown action: \`${action}\``,
        ephemeral: true,
      });
  }
}
