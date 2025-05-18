import githubDiscordMapJson from "../../../data/githubDiscordMap.json";

// New structure: map from GitHub username to object with discordId
const githubDiscordMap: {
  [key: string]: {
    githubUsername: string;
    githubId: string;
    discordId: string;
  };
} = githubDiscordMapJson;

// TODO: this any should be the generalized discord.js interaction type so that all interactions can leverage this method
export const can = (interaction: any): boolean => {
  const userId = interaction.user?.id;

  const discordIds = Object.values(githubDiscordMap).map(
    (entry) => entry.discordId,
  );
  const isAuthorized = discordIds.includes(userId);

  return isAuthorized;
};
