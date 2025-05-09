import { Client, GatewayIntentBits, Events } from "discord.js";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = new Map<string, any>();
const commandFiles = fs.readdirSync(path.join(__dirname, "commands"));

(async () => {
  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    commands.set(command.data.name, command);
  }
})();

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

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
});

client.login(process.env.DISCORD_APP_TOKEN);
