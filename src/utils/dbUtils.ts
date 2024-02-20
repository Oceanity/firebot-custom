import { ensureDir } from "fs-extra";
import { join, dirname } from "path";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { FindCallback, JsonDB } from "node-json-db";
import { getRandomItem } from "./array";

export default class DbUtils {
  private readonly path: string;
  private readonly modules: ScriptModules;
  private readonly dir: string;

  private db?: JsonDB;
  private ready: boolean = false;

  /**
   * Instantiates DbUtils class
   * @param {string} path The relative path to the created .db file
   * @param {ScriptModules} modules ScriptModules reference for logging
   */
  constructor(modules: ScriptModules, path: string = "./db/database.db") {
    this.modules = modules;
    this.path = join(__dirname, path);
    this.dir = dirname(this.path);
  }

  /**
   * Creates provided output dir and prepares helper functions
   */
  public async setup(): Promise<void> {
    const { JsonDb, logger } = this.modules;

    logger.info(`Ensuring directory "${this.dir}" exists...`);
    await ensureDir(this.dir);

    //@ts-expect-error 2351
    this.db = new JsonDb(this.path, true, true);

    this.ready = true;
  }

  /**
   * Gets data from loaded db at given path
   * @param {string} path Path of data to pull from db
   * @param {T?} defaults (Optional) Default data to fill db at path if none found
   * @returns {T} Returns data <T> stored in the loaded db at the given path
   */
  public async get<T>(path: string, defaults?: T): Promise<T | undefined> {
    const { logger } = this.modules;
    try {
      return this.db?.getData(path) as T;
    } catch (err) {
      if (defaults) this.db?.push(path, defaults, true);
      logger.error(`Failed to get "${path}" from "${this.path}"`);
      return undefined;
    }
  }

  public getRandom = async <T>(path: string): Promise<T | undefined> =>
    getRandomItem<T>(await this.db?.getData(path));

  /**
   *  Puts data into loaded db at given path
   * @param {string} path Path of data to pull from db
   * @param {T} data Data to be put in db
   * @param {boolean} override If `true`, will overwrite data in the db
   * @returns {boolean} `true` if operation completed successfully
   */
  public async push<T>(path: string, data: T, override?: boolean): Promise<boolean> {
    const { logger } = this.modules;
    try {
      this.db?.push(path, data, override);
      return true;
    } catch (err) {
      logger.error(`Failed to push "${typeof data}" to "${path}" in "${this.path}"`);
      return false;
    }
  }

  public async filter(path: string, findCallback: FindCallback): Promise<boolean> {
    const { logger } = this.modules;
    try {
      await this.db?.filter(path, findCallback);
      return true;
    } catch (err) {
      logger.error(`Failed to filter "${path}" in "${this.path}"`);
      return false;
    }
  }

  /**
   * Get count of array items
   * @param {string} path Path of array to count in db
   * @returns {number} Number of items in array, or -1 on error
   */
  public count = async (path: string): Promise<number> =>
      (await this.db?.count(path)) ?? -1;

  /**
   * Check if DbUtils has run `setup()` and is able to handle commands
   * @returns {boolean} `true` if DbUtils has run `setup()` and is able to handle commands
   */
  public isReady = (): boolean => this.ready;

  public isInBounds = async (path: string, index?: number): Promise<boolean> =>
    index != undefined
    && await this.count(path) > index;
}
