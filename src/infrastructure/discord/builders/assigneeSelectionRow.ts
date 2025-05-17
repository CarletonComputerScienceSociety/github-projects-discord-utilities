import { ActionRowBuilder, UserSelectMenuBuilder } from "discord.js";

export const buildAssigneeSelectionRow = () => {
  return new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId("create-issue:assigneeSelect")
      .setPlaceholder("Choose a user")
      .setMinValues(1)
      .setMaxValues(1),
  );
};
