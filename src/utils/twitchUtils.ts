import db from "@/utils/dbUtils";
import store from "@u/store";
import open from "open";

/**
 * Utility class for Twitch-related functionality
 */
export default class TwitchUtils {
  private static readonly path = "./db/twitch";
  private static readonly scopes = ["moderator:read:chatters"];

  /**
   * Retrieves the token flow asynchronously.
   *
   * @return {Promise<void>} Promise that resolves when the token flow is retrieved
   */
  static async getTokenFlowAsync() {
    const token = await db.getAsync<string>(this.path, "/token", "");
    if (token) return;

    const params = [
      "response_type=token",
      `client_id=${process.env.TWITCH_CLIENT_ID}`,
      `redirect_uri=${store.firebotApiBase}/twitch/token`,
      `scope=${TwitchUtils.scopes.join("+")}`,
      `state=${store.state}`, // Use current state in store to validate results
    ];

    open(`https://id.twitch.tv/oauth2/authorize?${params.join("&")}`);
  }

  /**
   * Gets any unshared Twitch clips and posts them to the appropriate channel.
   * @returns `true` if the clips were successfully posted, otherwise `false`.
   */
  static async postUnsharedClips(): Promise<boolean> {
    const lastCheckedDateStr = await db.getAsync<string>(this.path, "/clipsLastChecked", new Date().toLocaleString());

    if (lastCheckedDateStr && new Date().getTime() - new Date(lastCheckedDateStr).getTime() < 14 * 24 * 60 * 60 * 1000)
      return true;

    return true;
  }

  /**
   * Gets the date of the last checked Twitch clips.
   *
   * @return {Promise<string>} A promise that resolves to an ISO 8601 string representing the date of the last checked clips
   */
  static getLastCheckedClipsDateAsync = async (): Promise<string> =>
    (await db.getAsync<string>(this.path, "/clipsLastChecked", new Date().toISOString())) ?? new Date().toISOString();

  /**
   * Sets the date of the last checked Twitch clips.
   *
   * @return {Promise<boolean>} A promise that resolves to `true` if the date was successfully set, otherwise `false`
   */
  static setLastCheckedClipsDateAsync = async (): Promise<boolean> =>
    await db.push<string>(this.path, "/clipsLastChecked", new Date().toISOString());

  static getNonSubMessage = async (message: string): Promise<string | undefined> =>
    message.replace(/oceani18[a-zA-Z0-9]+/g, "<3 ");
}
