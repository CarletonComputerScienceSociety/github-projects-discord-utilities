import { ItemService } from "@src/items/services";
import { UserSelectMenuInteraction } from "discord.js";
import githubDiscordMapJson from "../../../../data/githubDiscordMap.json";

// Updated structure of the map
const githubDiscordMap: {
  [githubUsername: string]: {
    githubUsername: string;
    githubId: string;
    discordId: string;
  };
} = githubDiscordMapJson;

export async function assigneeSelectInteraction(
  interaction: UserSelectMenuInteraction,
): Promise<void> {
  const match = interaction.customId.match(/^issue:assignee:select:(.+)$/);
  if (!match) {
    throw new Error("Invalid customId format");
  }

  const githubIssueId = match[1];
  const selectedUserId = interaction.values[0];

  // Find the GitHub ID using the selected Discord ID
  const githubId = Object.values(githubDiscordMap).find(
    (entry) => entry.discordId === selectedUserId,
  )?.githubId;

  if (!githubId) {
    await interaction.reply({
      content: "❌ Unable to find linked GitHub account for selected user.",
      ephemeral: true,
    });
    return;
  }

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
