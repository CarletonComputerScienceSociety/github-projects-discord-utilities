import { UserService } from "@src/items/services/UserService";

export const can = async (interaction: any): Promise<boolean> => {
  const userId = interaction.user?.id;
  if (!userId) return false;

  const userResult = await UserService.findUserByDiscordID(userId);
  return userResult.ok;
};
