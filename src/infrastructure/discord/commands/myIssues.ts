import {
  SlashCommandBuilder,
  CommandInteraction,
} from "discord.js";
import { GithubAPI } from "@infrastructure/github";
import logger from "@config/logger";
import githubDiscordMapJson from "../../../../data/githubDiscordMap.json";
import { can } from "../authz";
import { buildIssueButtonRow } from "../builders";

const githubDiscordMap: { [githubUsername: string]: string } =
  githubDiscordMapJson;

export const data = new SlashCommandBuilder()
  .setName("my-issues")
  .setDescription("List all GitHub project issues assigned to you");

export async function execute(interaction: CommandInteraction) {
  if (!can(interaction)) {
    await interaction.reply({
      content: "You do not have permission to create an issue.",
      ephemeral: true,
    });
    return;
  }
  const discordUserId = interaction.user.id;

  // Find GitHub username from Discord ID
  const githubUsername = Object.keys(githubDiscordMap).find(
    (ghUser) => githubDiscordMap[ghUser] === discordUserId,
  );

  if (!githubUsername) {
    await interaction.reply({
      content: "❌ You don’t appear to be linked to a GitHub account.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const githubItemsResult = await GithubAPI.fetchProjectItems();
  if (githubItemsResult.err) {
    logger.error({
      event: "myIssues.error",
      body: githubItemsResult.val.message,
    });

    await interaction.editReply({
      content: "❌ Failed to fetch issues from GitHub.",
    });
    return;
  }

  const assignedItems = githubItemsResult.val.filter(
    (item) =>
      Array.isArray(item.assignedUsers) &&
      item.assignedUsers.some((assigneeUrl: string) =>
        assigneeUrl.endsWith(`/${githubUsername}`),
      ),
  );

  if (assignedItems.length === 0) {
    await interaction.editReply({
      content: "✅ You have no assigned issues at the moment.",
    });
    return;
  }

  await interaction.editReply({
    content: `📋 Showing ${assignedItems.length} issue(s) assigned to you:`,
  });

  for (const item of assignedItems.slice(0, 5)) {
    const link = item.url ?? "https://github.com/";

    const buttons = buildIssueButtonRow(item.githubId, link, ["unassign", "open"]);

    await interaction.followUp({
      content: `## ${item.title}`,
      components: [buttons],
      ephemeral: true,
    });
  }

  logger.info({
    event: "myIssues.success",
    body: `${assignedItems.length} issues returned for ${githubUsername}`,
  });
}
