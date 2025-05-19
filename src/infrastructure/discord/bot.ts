import { Client, GatewayIntentBits, Events } from "discord.js";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { handleModalSubmit } from "./commands/createIssue";
import {
  assigneeSelectInteraction,
  issueButtonInteraction,
} from "./interactions";
import { schedule } from "./scheduler";

config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = new Map<string, any>();

// Load slash commands
const commandFiles = fs.readdirSync(path.join(__dirname, "commands"));
(async () => {
  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    commands.set(command.data.name, command);
  }
})();

client.once(Events.ClientReady, (client) => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  schedule(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error executing this command.",
        ephemeral: true,
      });
    }
  }

  if (
    interaction.isModalSubmit() &&
    interaction.customId === "create-issue:modal"
  ) {
    await handleModalSubmit(interaction);
  }

  // TODO: need more specificity on this check as there could be other user select interactions
  if (interaction.isUserSelectMenu()) {
    await assigneeSelectInteraction(interaction);
  }

  // TODO: need more specificity on this check as there could be other button interactions
  if (interaction.isButton()) {
    await issueButtonInteraction(interaction);
  }
});

client.login(process.env.DISCORD_APP_TOKEN);
