import { ensureDir } from "fs-extra";
import { join, dirname } from "path";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { FindCallback, JsonDB } from "node-json-db";
import * as _ from "lodash";
import { getRandomInteger } from "./numbers";

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

  public getFirst = async <T>(path:string): Promise<T | undefined> =>
    _.first(await this.db?.getData(path));

  public getLast = async <T>(path:string): Promise<T | undefined> =>
    _.last(await this.db?.getData(path));

  public getRandom = async <T>(path: string, defaults?: T[]): Promise<T | undefined> =>
    _.nth((await this.get<T[]>(path, defaults)), getRandomInteger(await this.count(path)));

  /**
   *  Puts data into loaded db at given path
   * @param {string} path Path of data to pull from db
   * @param {T} data Data to be put in db
   * @param {boolean} override If `true`, will overwrite data in the db
   * @returns {boolean} `true` if operation completed successfully
   */
  public push = async <T>(path: string, data: T, override: boolean = false, allowDuplicates: boolean = false): Promise<boolean> => {
    try {
      if (!allowDuplicates) {
        const find = await this.db?.find<T>(path, d => d == data);
        this.modules.logger.info(typeof find);
        if (find) throw new Error(`Item already exists in table ${path} in db ${this.path}`);
      }
      this.db?.push(path, data, override);
      return true;
    } catch (err) {
      this.modules.logger.error(err as string);
      return false;
    }
  }

  public filter = async <T>(path: string, findCallback: FindCallback): Promise<T[]> => {
    try {
      return await this.db?.filter<T>(path, findCallback) ?? [];
    } catch (err) {
      this.modules.logger.error(`Failed to filter "${path}" in "${this.path}"`);
      return [];
    }
  }

  public delete = async (path: string, findCallback: FindCallback): Promise<boolean> => {
    try {
      const oldCount = await this.count(path);
      const filterResponse = await this.db?.filter(path, findCallback);
      await this.db?.push(path, filterResponse, true);
      return filterResponse !== undefined && oldCount === await this.count(path);
    } catch (err) {
      this.modules.logger.error(`Failed to delete "${path}" in "${this.path}"`);
      return false;
    }
  }

  public delete2 = async <T>(path: string, data: T): Promise<boolean> => {
    try {
      const oldCount = await this.count(path);
      const filtered = await this.filter(path, d => d !== data);
      if (oldCount == filtered.length) throw new Error("Could not find item to delete");
      await this.push(path, filtered, true);
      return true;
    } catch (err) {
      this.modules.logger.error(err as string);
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
