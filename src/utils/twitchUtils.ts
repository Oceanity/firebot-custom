import db from "@/utils/dbUtils";
import axios, { AxiosResponse } from "axios";
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

  /**
   * Check if the user is in the chat by making a request to the Twitch API.
   *
   * @param {AxiosHeaders} headers - The headers for the request
   * @param {TwitchChatterSearchRequest} request - The request containing user information
   * @return {Promise<boolean>} A promise that resolves to a boolean indicating if the user is in the chat
   */
  static async isUserInChatAsync(request: TwitchChatterSearchRequest): Promise<boolean> {
    const { clientId, authToken, search, broadcasterId } = request;
    if (!search.user_login && !search.user_id) return false;

    let endFound = false;
    let pageToken = undefined;

    while (!endFound) {
      store.modules.logger.info(`Checking if ${search.user_login || search.user_id} is in chat ${broadcasterId}...`);
      store.modules.logger.info(clientId, authToken);

      const response: AxiosResponse = await axios.get("https://api.twitch.tv/helix/chat/chatters", {
        params: {
          broadcaster_id: broadcasterId,
          moderator_id: broadcasterId,
          first: 1000,
          after: pageToken,
        },
        headers: {
          "Client-ID": clientId,
          Authorization: `Bearer ${authToken}`,
        },
      });
      const body = response.data;

      store.modules.logger.info(JSON.stringify(body));

      if (body.error) {
        store.modules.logger.error(JSON.stringify(body));
        return false;
      }

      const chatters = body.data as TwitchChatter[];

      store.modules.logger.info(JSON.stringify(chatters));

      if (
        chatters &&
        chatters.some(
          (a) =>
            (search.user_id && a.user_id == search.user_id) || (search.user_login && a.user_login == search.user_login),
        )
      )
        return true;

      if (!body || !body.pagination || !body.pagination.cursor) {
        endFound = true;
      } else {
        pageToken = body.pagination.cursor;
      }
    }

    return false;
  }
}

/** Chatters Endpoint Types */
type TwitchChatterSearchRequest = {
  clientId: string;
  authToken: string;
  broadcasterId: string;
  search: {
    user_login?: string;
    user_id?: string;
  };
};

type TwitchChatter = {
  user_id: string;
  user_login: string;
  user_name: string;
};
