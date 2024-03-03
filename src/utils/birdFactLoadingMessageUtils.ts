import { PatchResults } from "@t/db";
import db from "@/utils/dbUtils";

/**
 * Utility class for getting, adding, and updating the loading message in the database.
 */
export default class BirdFactLoadingMessageUtils {
  private static readonly path = "./db/birbFactLoadingMessages";
  private static readonly route = "/loadingMessages";
  private static readonly defaultVal = "Generating new birb fact...";

  /**
   * Gets a random loading message from the database or the default message if the database is empty.
   * @returns A promise that resolves to a random loading message.
   */
  static getRandomMessageAsync = async (): Promise<string> =>
    (await db.getRandom<string>(this.path, this.route, [this.defaultVal])) ?? this.defaultVal;

  /**
   * Gets all loading messages from the database or the default message if the database is empty.
   * @returns A promise that resolves to an array of loading messages.
   */
  static getAllMessagesAsync = async (): Promise<string[]> =>
    (await db.getAsync<string[]>(this.path, this.route, [this.defaultVal])) ?? [this.defaultVal];

  /**
   * Adds a loading message to the database.
   * @param loadingMessage The loading message to add.
   * @returns A promise that resolves to true if the operation was successful, false otherwise.
   */
  static addMessageAsync = async (loadingMessage: string): Promise<boolean> =>
    await db.push<string>(this.path, `${this.route}[]`, loadingMessage);

  /**
   * Updates a loading message in the database.
   * @param search The search string to match against the current loading message.
   * @param replace The replacement string for the matched loading message.
   * @returns A promise that resolves to the patch results or undefined if the operation failed.
   */
  static updateMessageAsync = async (search: string, replace: string): Promise<PatchResults<string> | undefined> =>
    await db.update<string>(this.path, this.route, search, replace);

  // /**
  //  * Deletes a loading message from the database.
  //  * @param search The search string to match against the current loading message.
  //  * @returns A promise that resolves to the delete results or undefined if the operation failed.
  //  */
  // static deleteMessageAsync = async (search: string): Promise<DeleteResults<string> | undefined> =>
  //   await db.delete<string>(this.path, search);
}
