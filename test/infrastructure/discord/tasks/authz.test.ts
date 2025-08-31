import { can } from "@infrastructure/discord/authz";

describe("auth tests", () => {
    it("will accept one role with all permissions", () =>{
        const discordID = "693093284998021141";
        jest.mock(
            "../../../../data/githubDiscordMap.json",
            () => ({
                User1: {
                    discordID: discordID,
                    roles: ["admin"],
                },
            }),
            { virtual: true },
        );
        expect(can(discordID, ["githubIssue:write", "githubIssue:read"])).toBe(true);
    });

    it("will throw an error if user has no roles", () =>{
        const discordID = "12345";
        jest.mock(
            "../../../../data/githubDiscordMap.json",
            () => ({
                User1: {
                    discordID: discordID,
                    roles: [],
                },
            }),
            { virtual: true },
        );
        expect(can(discordID, ["githubIssue:read", "githubIssue:write"])).toBe(false);
    });

    it("will throw an error if user does not have all of the required permissions", () =>{
        const discordID = "142782738615762944";
        jest.mock(
            "../../../../data/githubDiscordMap.json",
            () => ({
                User1: {
                    discordID: discordID,
                    roles: ["readonly"],
                },
            }),
            { virtual: true },
        );
        expect(can(discordID, ["githubIssue:read", "githubIssue:write"])).toBe(false);
    });

    it('will throw an error if the user is not in the map', () => {
        const id = "12345"; 
        expect(can(id, ["githubIssue:write", "githubIssue:read"])).toBe(false);
    });
});