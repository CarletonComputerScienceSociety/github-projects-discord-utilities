import { UserSelectMenuInteraction } from "discord.js";

export async function assigneeSelectInteraction(
  interaction: UserSelectMenuInteraction,
): Promise<void> {
  const selectedUserId = interaction.values[0];

  await interaction.update({
    content: `**Assigned**: <@${selectedUserId}>`,
    components: [],
  });
}
