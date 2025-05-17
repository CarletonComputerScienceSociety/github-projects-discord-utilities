import { CacheType, Interaction } from "discord.js";
import { promptAssigneeSelection } from "./promptAssigneeSelection";

export async function issueButtonInteraction(
  interaction: Interaction<CacheType>,
) {
  if (!interaction.isButton()) return;

  const [_issue, action, githubId] = interaction.customId.split(":");

  if (!githubId) {
    await interaction.reply({
      content: "⚠️ Invalid button ID.",
      ephemeral: true,
    });
    return;
  }

  switch (action) {
    case "edit":
      await interaction.reply({
        content: `✏️ Editing issue with ID \`${githubId}\` (not yet implemented).`,
        ephemeral: true,
      });
      break;

    case "assign":
      await promptAssigneeSelection(interaction);
      break;

    case "delete":
      await interaction.reply({
        content: `🗑️ Deleting issue \`${githubId}\` (not yet implemented).`,
        ephemeral: true,
      });
      break;

    default:
      // logger.warn({ event: "button.unknownAction", action });
      await interaction.reply({
        content: `❌ Unknown action: \`${action}\``,
        ephemeral: true,
      });
  }
}
