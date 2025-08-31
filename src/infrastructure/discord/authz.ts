import githubDiscordMapJson from "../../../data/githubDiscordMap.json";
import rolesJson from "../../../data/roles.json";

// New structure: map from GitHub username to object with discordId
const githubDiscordMap: {
  [key: string]: {
    githubUsername: string;
    githubId: string;
    discordId: string;
    roles: string[];
  };
} = githubDiscordMapJson;

const roles: {
  [role: string]: {
    permissions: string[];
  };
} = rolesJson;

export const can = (discordUserID: string, perms: string[]): boolean => {
  const userEntry = Object.values(githubDiscordMap).find(
    (entry: any) => entry.discordId === discordUserID
  );

  if (!userEntry || !userEntry.roles) {
    return false; 
  } 

  const userPermissions = new Set(
    userEntry.roles.flatMap((role: string) => roles[role]?.permissions || [])
  );

  return perms.every(perm => userPermissions.has(perm));
};