import { REST, Routes } from "discord.js";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

config();

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".ts"));

(async () => {
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_APP_TOKEN!,
  );

  rest
    .put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID!,
        process.env.DISCORD_GUILD_ID!,
      ),
      {
        body: commands,
      },
    )
    .then(() => console.log("✅ Successfully registered application commands."))
    .catch(console.error);
})();
