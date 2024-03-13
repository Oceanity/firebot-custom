import Fuse from "fuse.js";
import db from "@u/dbUtils";
import twitch from "@u/twitchUtils";

type FindItemSlugResult = {
  game: string;
  search: string;
  found: boolean;
  displayName?: string;
  closestMatches?: string[];
};

type EmoTrackerItem = {
  slug: string;
  aliases: string[];
  displayName: string;
  incremental: boolean;
};

export default class EmoTrackerUtils {
  private static readonly path = "./db/emoTracker";
  private static readonly route = "/emoTracker";
  private static readonly emoTrackerId = "194652423";
  private static readonly emoTrackerLogin = "emotracker";

  static isEmoTrackerConnectedAsync = async (
    clientId: string,
    authToken: string,
    broadcasterId: string,
  ): Promise<boolean> =>
    await twitch.isUserInChatAsync({
      clientId,
      authToken,
      broadcasterId,
      search: {
        user_id: EmoTrackerUtils.emoTrackerId,
        user_login: EmoTrackerUtils.emoTrackerLogin,
      },
    });

  /**
   * Find item slug for a given game and search query.
   *
   * @param game The game to search for
   * @param search The search query
   * @return The result of the search, or the closest matches if not found
   */
  static async findItemSlug(game: string, search: string): Promise<FindItemSlugResult> {
    const result = await db.getAsync<EmoTrackerItem[]>(this.path, `${this.route}/${game}`, []);
    search = search.toLowerCase().trim();

    if (!result) throw `Could not get items from game ${game}`;

    const fuse = new Fuse(result, {
      keys: ["displayName", "aliases"],
    });
    const searchResults = fuse.search(search);
    const item = searchResults[0].item ?? undefined;
    if (item && (item.aliases.includes(search) || item.slug == search)) {
      return {
        game,
        search,
        found: true,
        displayName: item.displayName,
      };
    }

    return {
      game,
      search,
      found: false,
      closestMatches: searchResults.map((r) => r.item.slug),
    };
  }
}
