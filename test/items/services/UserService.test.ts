import { UserService } from "@src/items/services/UserService";

jest.mock("../../../data/githubDiscordMap.json", () => ({
  alice: {
    githubUsername: "alice",
    githubId: "ghid-alice",
    discordId: "discord-alice",
  },
  bob: {
    githubUsername: "bob",
    githubId: "ghid-bob",
    discordId: "discord-bob",
  },
}));

describe("UserService", () => {
  it("finds user by Discord ID", async () => {
    const result = await UserService.findUserByDiscordID("discord-bob");
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.val.githubUsername).toBe("bob");
    }
  });

  it("will return error for unknown Discord ID", async () => {
    const result = await UserService.findUserByDiscordID("unknown");
    expect(result.err).toBe(true);
  });

  it("finds user by GitHub username", async () => {
    const result = await UserService.findUserByGithubUsername("alice");
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.val.discordId).toBe("discord-alice");
    }
  });

  it("will return error for unknown GitHub username", async () => {
    const result = await UserService.findUserByGithubUsername("charlie");
    expect(result.err).toBe(true);
  });
});
