import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { GithubAPI } from "@infrastructure/github";
import { filterForUnassigned } from "@src/items";
import logger from "@config/logger";
import { can } from "../authz";
import { buildIssueButtonRow } from "../builders";
import { formatDiscordDate } from "../webhookMessages";

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
  )
  .addIntegerOption((option) =>
    option
      .setName("index")
      .setDescription("Index of the specific issue to display")
      .setRequired(false),
  );

export async function execute(interaction: CommandInteraction) {
  if (!can(interaction.user.id, ["githubissue:read"])) {
    await interaction.reply({
      content: "You do not have permission to view issues.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  // @ts-ignore // TODO: Fix types
  const dateRange = interaction.options.getString("date-range", true);
  // @ts-ignore
  const issueIndex = interaction.options.getInteger("index");

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

  if (issueIndex !== null) {
    if (issueIndex < 0 || issueIndex >= unassignedItems.length) {
      await interaction.editReply({
        content: `❌ Invalid issue index. Please use a number between 0 and ${unassignedItems.length - 1}.`,
      });
      return;
    }

    const item = unassignedItems[issueIndex];
    const link = item.url ?? "https://github.com/";

    const buttons = buildIssueButtonRow(item.githubIssueId, link, [
      "assign",
      "open",
    ]);

    await interaction.editReply({
      content: `📌 **Issue #${issueIndex}**\n## ${item.title}`,
      components: [buttons],
    });

    return;
  }

  // Show list of issues with index numbers
  const list = unassignedItems
    .map((item, idx) => {
      const titleWithLink = `[${item.title}](<${item.url}>)`;
      const due = item.dueDate ? formatDiscordDate(item.dueDate) : "";
      const status = item.status ?? "";

      return `\`${idx}\` — ${titleWithLink}${due ? ` - ${due}` : ""}${status ? ` - ${status}` : ""}`;
    })
    .join("\n");

  await interaction.editReply({
    content: `📋 ${unassignedItems.length} unassigned issue(s) found:\n\n${list}\n\nUse \`/unassigned-issues date-range:${dateRange} index:<number>\` to view a specific issue.`,
  });

  logger.info({
    event: "unassignedIssues.success",
    body: `${unassignedItems.length} unassigned issues returned.`,
  });
}
