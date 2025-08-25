import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { GithubAPI } from "@infrastructure/github";
import logger from "@config/logger";
import { UserService } from "@src/items/services/UserService";
import { can } from "../authz";
import { buildIssueButtonRow } from "../builders";
import { formatDiscordDate } from "../webhookMessages";

export const data = new SlashCommandBuilder()
  .setName("my-issues")
  .setDescription("List all GitHub project issues assigned to you")
  .addIntegerOption((option) =>
    option
      .setName("index")
      .setDescription("Index of the specific issue to display")
      .setRequired(false),
  );

export async function execute(interaction: CommandInteraction) {
  if (!can(interaction)) {
    await interaction.reply({
      content: "You do not have permission to create an issue.",
      ephemeral: true,
    });
    return;
  }

  const discordUserId = interaction.user.id;

  const userResult = await UserService.findUserByDiscordID(discordUserId);
  if (userResult.err) {
    await interaction.reply({
      content: "❌ You don’t appear to be linked to a GitHub account.",
      ephemeral: true,
    });
    return;
  }

  const githubUsername = userResult.val.githubUsername;

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

  // @ts-ignore // TODO: Fix type error
  const issueIndex = interaction.options.getInteger("index");

  if (issueIndex !== null) {
    if (issueIndex < 0 || issueIndex >= assignedItems.length) {
      await interaction.editReply({
        content: `❌ Invalid issue index. Please use a number between 0 and ${assignedItems.length - 1}.`,
      });
      return;
    }

    const item = assignedItems[issueIndex];
    const link = item.url ?? "https://github.com/";

    const buttons = buildIssueButtonRow(item.githubIssueId, link, [
      "unassign",
      "open",
    ]);

    await interaction.editReply({
      content: `📌 **Issue #${issueIndex}**\n## ${item.title}`,
      components: [buttons],
    });

    return;
  }

  // Show list of issues with index numbers
  const list = assignedItems
    .map((item, idx) => {
      const titleWithLink = `[${item.title}](<${item.url}>)`;
      const due = item.dueDate ? formatDiscordDate(item.dueDate) : "";
      const status = item.status ?? "";

      return `\`${idx}\` — ${titleWithLink}${due ? ` - ${due}` : ""}${status ? ` - ${status}` : ""}`;
    })
    .join("\n");
  await interaction.editReply({
    content: `📋 You have ${assignedItems.length} assigned issue(s):\n\n${list}\n\nUse \`/my-issues index:<number>\` to view a specific issue.`,
  });

  logger.info({
    event: "myIssues.success",
    body: `${assignedItems.length} issues returned for ${githubUsername}`,
  });
}
