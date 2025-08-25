import { ItemService } from "@src/items/services";
import { UserSelectMenuInteraction } from "discord.js";
import { UserService } from "@src/items/services/UserService";

export async function assigneeSelectInteraction(
  interaction: UserSelectMenuInteraction,
): Promise<void> {
  const match = interaction.customId.match(/^issue:assignee:select:(.+)$/);
  if (!match) {
    throw new Error("Invalid customId format");
  }

  const githubIssueId = match[1];
  const selectedUserId = interaction.values[0];

  const userResult = await UserService.findUserByDiscordID(selectedUserId);
  if (userResult.err) {
    await interaction.reply({
      content: "❌ You don’t appear to be linked to a GitHub account.",
      ephemeral: true,
    });
    return;
  }

  // Find the GitHub ID using the selected Discord ID
  const githubId = userResult.val.githubId;

  const result = await ItemService.updateAssignee({
    itemId: githubIssueId,
    assigneeId: githubId,
  });

  if (result.err) {
    await interaction.reply({
      content:
        "❌ Failed to update assignee. Cannot assign to Draft Issues (yet).",
      ephemeral: true,
    });
    return;
  }

  await interaction.update({
    content: `**Assigned**: <@${selectedUserId}>`,
    components: [],
  });
}
