import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

type IssueButtonOperation = "edit" | "assign" | "unassign" | "delete" | "open";

export const buildIssueButtonRow = (
  issueId: string,
  link: string,
  operations: IssueButtonOperation[] = [
    "edit",
    "assign",
    "unassign",
    "delete",
    "open",
  ],
) => {
  const row = new ActionRowBuilder<ButtonBuilder>();

  if (operations.includes("edit")) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`issue:edit:${issueId}`)
        .setLabel("Edit")
        .setStyle(ButtonStyle.Primary),
    );
  }

  if (operations.includes("assign")) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`issue:assign:${issueId}`)
        .setLabel("Assign")
        .setStyle(ButtonStyle.Secondary),
    );
  }

  if (operations.includes("unassign")) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`issue:unassign:${issueId}`)
        .setLabel("Unassign")
        .setStyle(ButtonStyle.Secondary),
    );
  }

  if (operations.includes("delete")) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`issue:delete:${issueId}`)
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger),
    );
  }

  if (operations.includes("open")) {
    row.addComponents(
      new ButtonBuilder()
        .setLabel("Open")
        .setStyle(ButtonStyle.Link)
        .setURL(link),
    );
  }

  return row;
};
