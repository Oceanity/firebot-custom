import db from "@/utils/dbUtils";
import store from "@u/store";

/**
 * Utility class for Twitch-related functionality
 */
export default class TwitchClipUtils {
  private static readonly path = "./db/twitchClips";

  /**
   * Gets any unshared Twitch clips and posts them to the appropriate channel.
   * @returns `true` if the clips were successfully posted, otherwise `false`.
   */
  public static async postUnsharedClips(): Promise<boolean> {
    const lastCheckedDate = await db.getAsync<Date>(this.path, "/clipsLastChecked", new Date());

    if (lastCheckedDate && new Date().getTime() - lastCheckedDate.getTime() < 14 * 24 * 60 * 60 * 1000) return true;

    store.modules.logger.info(`${lastCheckedDate}`);

    return true;
  }
}
