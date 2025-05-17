import githubDiscordMapJson from "../../../data/githubDiscordMap.json";

const githubDiscordMap: { [key: string]: string } = githubDiscordMapJson;

// TODO: this any should be the generalized discord.js interaction type so that all interactions can leverage this method
export const can = (interaction: any): boolean => {
  const userId = interaction.user?.id;

  const discordIds = Object.values(githubDiscordMap);
  const isAuthorized = discordIds.includes(userId);

  return isAuthorized;
};
