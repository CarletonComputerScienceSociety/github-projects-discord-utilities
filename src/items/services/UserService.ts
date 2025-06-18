import githubDiscordMap from "../../../data/githubDiscordMap.json";
import { Err, Ok, Result } from "ts-results";

export interface User {
    githubUsername: string;
    githubId: string;
    discordId: string;
}

const users: User[] = Object.values(githubDiscordMap);

export class UserService {
    static async findUserByDiscordID(discordId: string): Promise<Result<User, Error>> {
        const user = users.find((u) => u.discordId === discordId);
        return user ? Ok(user) : Err(new Error("Could not find user with that DiscordID"));
    }

    static async findUserByGithubUsername(githubUsername: string): Promise<Result<User, Error>> {
        const user = users.find((u) => u.githubUsername === githubUsername);
        return user ? Ok(user) : Err(new Error("Could not find user with that GitHub username"));
    }
}
