import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { GithubAPI } from "@infrastructure/github";
import { filterForUnassigned } from "@src/items";
import logger from "@config/logger";
import { can } from "../authz";
import { buildIssueButtonRow } from "../builders";

export const data = new SlashCommandBuilder()
  .setName("unassigned-issues")
  .setDescription("List unassigned issues created in a specific date range")
  .addStringOption((option) =>
    option
      .setName("date-range")
      .setDescription("Date range to filter issues by")
      .setRequired(true)
      .addChoices(
        { name: "Today", value: "today" },
        { name: "All Time", value: "all-time" },
      ),
  );

export async function execute(interaction: CommandInteraction) {
  if (!can(interaction)) {
    await interaction.reply({
      content: "You do not have permission to create an issue.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  //@ts-ignore // TODO fix this ignore
  const dateRange = interaction.options.getString("date-range", true);

  const githubItemsResult = await GithubAPI.fetchProjectItems();
  if (githubItemsResult.err) {
    logger.error({
      event: "unassignedIssues.error",
      body: githubItemsResult.val.message,
    });

    await interaction.editReply({
      content: "❌ Failed to fetch issues from GitHub.",
    });
    return;
  }

  let filtered = githubItemsResult.val;

  if (dateRange === "today") {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    filtered = filtered.filter((item) => {
      const createdAt = new Date(item.createdAt);
      return createdAt >= startOfDay;
    });
  }

  const unassignedItems = filterForUnassigned(filtered);

  if (unassignedItems.length === 0) {
    await interaction.editReply({
      content: `✅ No unassigned issues found.`,
    });
    return;
  }

  const limitedItems = unassignedItems.slice(0, 5);

  await interaction.editReply({
    content: `📋 Showing ${limitedItems.length} unassigned issue(s).`,
  });

  for (const item of limitedItems) {
    const link = item.url ?? "https://github.com/";

    const buttons = buildIssueButtonRow(item.githubId, link, [
      "assign",
      "open",
    ]);

    await interaction.followUp({
      content: `## ${item.title}`,
      components: [buttons],
      ephemeral: true,
    });
  }

  logger.info({
    event: "unassignedIssues.success",
    body: `${unassignedItems.length} unassigned issues returned.`,
  });
}
