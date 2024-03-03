import { JsonDB } from "node-json-db";
import store from "@u/store";
import { ensureDir } from "fs-extra";
import { dirname, resolve } from "path";
import { getRandomInteger } from "./numbers";

/**
 * Utility class for interacting with a static JsonDB.
 */
export default class StaticDbUtils {
  /**
   * Creates and sets up a JsonDB at the given path.
   * @param path Path to create the JsonDB at. If it doesn't include __dirname, it will be prepended.
   * @returns The created and set up JsonDB
   */
  static setup = async (path: string = "./db/firebotDb"): Promise<JsonDB> => {
    const { JsonDb } = store.modules;

    store.modules.logger.info(path);

    if (!path.includes(__dirname))
      path = resolve(__dirname, path);

    await ensureDir(dirname(path));

    //@ts-expect-error 18046
    return new JsonDb(path, true, true);
  }

  /**
   * Gets data from a JsonDB, with a fallback if it doesn't exist.
   * @param path Path to the JsonDB
   * @param route Route to the data in the JsonDB
   * @param defaults Default value to use if the data doesn't exist
   * @returns The data at the route, or the default value if it doesn't exist
   */
  static get = async <T>(
    path: string,
    route: string,
    defaults?: T | T[]
  ): Promise<T | undefined> => {
    const db = await this.setup(path);

    try {
      return db.getData(route) as T;
    } catch (err) {
      if (defaults) db.push(route, defaults, true);
      store.modules.logger.error(`Failed to get "${route}" from "${path}"`);
      return undefined;
    }
  }

  /**
   * Gets a random item from an array of data in a JsonDB.
   * @param path Path to the JsonDB
   * @param route Route to the data in the JsonDB
   * @param defaults Default values to use if the data doesn't exist
   * @returns A random item from the data at the route, or one of the default values if it doesn't exist
   */
  static getRandom = async <T>(
    path: string,
    route: string,
    defaults?: T[]
  ): Promise<T | undefined> => {
    const choices = await this.get<T[]>(path, route, defaults);

    if (!choices || !choices.length) {
      store.modules.logger.error(`Failed to get random "${route}" from "${path}"`);
      return undefined;
    }

    const random = getRandomInteger(choices.length - 1);
    return choices[random];
  }

  /**
   * Pushes data to a route in a JsonDB.
   * @param path Path to the JsonDB
   * @param route Route to the data in the JsonDB
   * @param data Data to push to the route. If it's not an array, it will be wrapped in one.
   * @returns Whether or not the data was successfully pushed.
   */
  static push = async<T>(path: string, route: string, data: T): Promise<boolean> => {
    const db = await this.setup(path);

    try {
      db.push(route, data, false);
      return true;
    } catch (err) {
      store.modules.logger.error(`Could not push to "${route}" in "${path}"`);
      return false;
    }
  }
}
