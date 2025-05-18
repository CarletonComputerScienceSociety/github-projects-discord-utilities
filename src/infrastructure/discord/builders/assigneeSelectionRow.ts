import { ActionRowBuilder, UserSelectMenuBuilder } from "discord.js";

export const buildAssigneeSelectionRow = (githubIssueId: string) => {
  return new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId(`issue:assignee:select:${githubIssueId}`)
      .setPlaceholder("Choose a user")
      .setMinValues(1)
      .setMaxValues(1),
  );
};
