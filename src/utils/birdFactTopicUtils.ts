import db from "@/utils/dbUtils";

/**
 * Class for handling birb fact topics.
 */
export default class birdFactTopicUtils {
  private static readonly path = "./db/birbFactTopics";
  private static readonly route = "/topics";
  private static readonly defaultVal = "most interesting features";

  /**
   * Gets a random topic from the database.
   * @returns A promise that resolves to a topic or default topic if the database is empty.
   */
  static getRandomTopicAsync = async (): Promise<string> =>
    (await db.getRandom<string>(this.path, this.route, [this.defaultVal])) ?? this.defaultVal;

  /**
   * Gets all topics from the database.
   * @returns A promise that resolves to an array of topics or array of default topics if the database is empty.
   */
  static getAllTopicsAsync = async (): Promise<string[]> =>
    (await db.getAsync<string[]>(this.path, this.route, [this.defaultVal])) ?? [this.defaultVal];

  /**
   * Adds a topic to the database.
   * @param topic The topic to add.
   * @returns A promise that resolves to `true` if the topic was added.
   */
  static addTopicAsync = async (topic: string | string[]): Promise<boolean> =>
    await db.push<string | string[]>(this.path, `${this.route}[]`, topic);

  /**
   * Updates a topic in the database.
   * @param search The search query.
   * @param replace The replacement value.
   * @returns A promise that resolves to the patch results or `undefined` if no matches were found.
   */
  // static async update(search: string, replace: string): Promise<PatchResults<string> | undefined> {
  //   return await this.db.update<string>(this.path, search, replace);
  // }
}
