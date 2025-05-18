import { ItemService } from "@src/items/services";
import { UserSelectMenuInteraction } from "discord.js";

export async function assigneeSelectInteraction(
  interaction: UserSelectMenuInteraction,
): Promise<void> {
  const match = interaction.customId.match(/^issue:assignee:select:(.+)$/);
  if (!match) {
    throw new Error("Invalid customId format");
  }
  const githubIssueId = match[1];
  const selectedUserId = interaction.values[0];
  const result = await ItemService.updateAssignee({
    itemId: githubIssueId,
    assigneeId: "MDQ6VXNlcjQzMjIzNjgy",
  });

  if (result.err) {
    await interaction.reply({
      content: "Failed to update assignee",
      ephemeral: true,
    });
    return;
  }

  await interaction.update({
    content: `**Assigned**: <@${selectedUserId}>`,
    components: [],
  });
}
