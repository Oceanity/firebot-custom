import { MastodonContext } from "@t/mastodon";
import birdFacts from "@u/birdFactUtils";
import db from "@/utils/dbUtils";
import env from "@u/envUtils";
import mastodon from "@u/mastodonUtils";
import store from "@u/store";

/**
 * Class with utility methods for posting new bird facts to Mastodon
 */
export default class MastodonBirdFactUtils {
  private static readonly path = "./db/mastodon";
  private static readonly route = "/birdFacts";
  private static readonly context: MastodonContext = {
    apiBase: "https://botsin.space/api",
    accessToken: env.getEnvVarOrThrow("BOTSINSPACE_ACCESS_TOKEN"),
  };

  /**
   * Gets the next ID to be used for a new bird fact
   * @returns The next ID or 1 if none found
   */
  static getNextBirdFactIdAsync = async (): Promise<number> =>
    (await db.getAsync<number>(this.path, `${this.route}/nextId`, 1)) ?? 1;

  /**
   * Increments the next ID to be used for a new bird fact
   * @returns true if successful, otherwise false
   */
  static pushNextBirdFactIdAsync = async (id?: number): Promise<boolean> =>
    await db.push<number>(this.path, `${this.route}/nextId`, id ?? (await this.getNextBirdFactIdAsync()) + 1);

  /**
   * Posts a new bird fact to Mastodon
   * @returns true if successful, otherwise false
   */
  static async postNewFactAsync(): Promise<boolean> {
    store.modules.logger.info("Posting birb fact to Mastodon...");

    const id = await this.getNextBirdFactIdAsync();
    const fact = await birdFacts.generateNewFactAsync(id);

    store.modules.logger.info(`Birb Fact #${fact.id}: ${fact.message} (topic ${fact.topic})`);

    const attachments = [];
    if (fact.iNatData) {
      attachments.push({
        url: fact.iNatData.photo_url,
        description: `Photo of a ${fact.bird.name}`,
      });
    }

    const status = [
      `🐦 Birb Fact #${fact.id}`,
      "────────────────────────────",
      [
        `${fact.bird.name} (${fact.bird.sciName})`,
        `${fact.message}`,
        `${fact.iNatData ? `📸 ${fact.iNatData.photo_attribution}` : ""}`,
      ].join("\n\n"),
    ]
      .join("\n")
      .trim();

    const response = await mastodon.postNewMessage(this.context, status, attachments);
    if (!response) throw "Failed to post new birb fact to Mastodon";

    await this.pushNextBirdFactIdAsync(id + 1);

    store.modules.logger.info("Successfully posted birb fact to Mastodon");
    return true;
  }
}
