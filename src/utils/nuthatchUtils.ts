import { Bird } from "@t/birdFacts";
import db from "@/utils/dbUtils";
import env from "@u/envUtils";
import helper from "@u/helperUtils";

/**
 * Utility class for interacting with the Nuthatch API.
 */
export default class NuthatchUtils {
  private static readonly apiBase = "https://nuthatch.lastelm.software/v2";
  private static readonly path = "./db/nuthatch";
  private static readonly birdsPerPage = 100;
  private static getHeaders = () =>
    new Headers({
      "Content-Type": "application/json",
      "API-Key": env.getEnvVarOrThrow("NUTHATCH_API_KEY"),
    });

  /**
   * Updates the cached data asynchronously.
   * @return A promise that resolves when the update is complete.
   */
  static async updateCachedDataAsync() {
    const dateString = await db.getAsync<string>(this.path, "/lastChecked", new Date().toLocaleString());
    const lastChecked = dateString ? new Date(dateString) : undefined;

    if (lastChecked && helper.isDateOlderThanDays(lastChecked, 14)) return;

    db.push<string>(this.path, "/lastChecked", new Date().toLocaleString());
    db.push<unknown[]>(this.path, "/birds", [], true);

    let hasFoundEnd = false;
    let page = 1;

    while (!hasFoundEnd) {
      const response = await fetch(`${this.apiBase}/birds?page=${page++}&pageSize=${this.birdsPerPage}`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();

      if (data.entities && data.entities.length) {
        if (!(await this.pushPageAsync(data.entities))) throw "Could not push Nuthatch entities to db";
      } else hasFoundEnd = true;
    }
  }

  /**
   * Pushes a page of entities to the db
   * @param entities The page of entities to push
   * @returns A promise that resolves to true if the push was successful, false otherwise
   */
  private static pushPageAsync = async (entities: Bird[]): Promise<boolean> =>
    await db.push<Bird[]>(this.path, "/birds", entities);

  /**
   * Retrieves a random bird from the nuthatch API
   * @returns A promise that resolves to a bird object from the API, or undefined if the API key is not set
   */
  static async getRandomBirdAsync(): Promise<Bird | undefined> {
    const bird = await db.getRandom<Bird>(this.path, "/birds", []);

    if (!bird) return undefined;

    // Catch [x or y] in scientific name
    const orMatch = /\[(.+)\s+or\s+(.+)\]/i;
    bird.sciName = bird.sciName.replace(orMatch, "$1");

    return bird;
  }
}
