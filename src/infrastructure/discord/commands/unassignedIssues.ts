import {
  SlashCommandBuilder,
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
  CacheType,
} from "discord.js";
import { GithubAPI } from "@infrastructure/github";
import { filterForUnassigned } from "@src/items";
import logger from "@config/logger";
import { can } from "../authz";

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

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`issue:edit:${item.githubId}`)
        .setLabel("Edit")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`issue:assign:${item.githubId}`)
        .setLabel("Assign")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`issue:delete:${item.githubId}`)
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setLabel("Open")
        .setStyle(ButtonStyle.Link)
        .setURL(link),
    );

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

export async function handleButtonInteraction(
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
      await interaction.reply({
        content: `👤 Assigning you to issue \`${githubId}\` (not yet implemented).`,
        ephemeral: true,
      });
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
