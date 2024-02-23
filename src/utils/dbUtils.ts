import { ensureDir } from "fs-extra";
import { join, dirname } from "path";
import { FindCallback, JsonDB } from "node-json-db";
import * as _ from "lodash";
import { getRandomInteger } from "./numbers";
import Fuse, { IFuseOptions } from "fuse.js";
import store from "@u/global";

export default class DbUtils {
  private readonly path: string;
  private readonly dir: string;

  private db?: JsonDB;
  private ready: boolean = false;

  /**
   * Instantiates DbUtils class
   * @param {string} path The relative path to the created .db file
   * @param {ScriptModules} modules ScriptModules reference for logging
   */
  constructor(path: string = "./db/database.db") {
    this.path = join(__dirname, path);
    this.dir = dirname(this.path);
  }

  /**
   * Creates provided output dir and prepares helper functions
   */
  setup = async (): Promise<DbUtils> => {
    const { JsonDb, logger } = store.modules;

    logger.info(`Ensuring directory "${this.dir}" exists...`);
    await ensureDir(this.dir);

    //@ts-expect-error 18046
    this.db = new JsonDb(this.path, true, true);
    this.ready = true;

    return this;
  }

  /**
   * Gets data from loaded db at given path
   * @param {string} path Path of data to pull from db
   * @param {T?} defaults (Optional) Default data to fill db at path if none found
   * @returns {T} Returns data <T> stored in the loaded db at the given path
   */
  get = async <T>(path: string, defaults?: T): Promise<T | undefined> => {
    const { logger } = store.modules;

    try {
      return this.db?.getData(path) as T;
    } catch (err) {
      if (defaults) this.db?.push(path, defaults, true);
      logger.error(`Failed to get "${path}" from "${this.path}"`);
      return undefined;
    }
  }

  getFirst = async <T>(path:string): Promise<T | undefined> =>
    _.first(await this.db?.getData(path));

  getLast = async <T>(path:string): Promise<T | undefined> =>
    _.last(await this.db?.getData(path));

  getRandom = async <T>(path: string, defaults?: T[]): Promise<T | undefined> =>
    _.nth((await this.get<T[]>(path, defaults)), getRandomInteger(await this.count(path)));

  /**
   *  Puts data into loaded db at given path
   * @param {string} path Path of data to pull from db
   * @param {T} data Data to be put in db
   * @param {boolean} override If `true`, will overwrite data in the db
   * @returns {boolean} `true` if operation completed successfully
   */
  push = async <T>(path: string, data: T, override: boolean = false, allowDuplicates: boolean = false): Promise<boolean> => {
    try {
      if (!allowDuplicates) {
        const find = await this.db?.find<T>(path, d => d == data);
        if (find) throw new Error(`Item already exists in table ${path} in db ${this.path}`);
      }
      this.db?.push(path, [data], override);
      return true;
    } catch (err) {
      store.modules.logger.error(err as string);
      return false;
    }
  }

  filter = async <T>(path: string, findCallback: FindCallback): Promise<T[]> => {
    try {
      return await this.db?.filter<T>(path, findCallback) ?? [];
    } catch (err) {
      store.modules.logger.error(`Failed to filter "${path}" in "${this.path}"`);
      return [];
    }
  }

  update = async <T>(path: string, search: string, replace: T, fuseOptions?: IFuseOptions<T>): Promise<T | undefined> => {
    try {
      const data = await this.db?.getData(path);
      const fuse = new Fuse(data, fuseOptions);
      const results = fuse.search(search);
      if (!results) throw "Could not find item to update";
      data[results[0].refIndex] = replace;
      this.db?.push(path, data, true);
      return results[0].item;
    } catch (err) {
      return undefined;
    }
  }

  delete = async <T>(path: string, search: string, fuseOptions?: IFuseOptions<T>): Promise<T | undefined> => {
    try {
      const fuse = new Fuse(await this.db?.getData(path), fuseOptions);
      const results = fuse.search(search);
      if (!results) throw "Could not find item to delete";
      const filtered = this.db?.filter(path, d => d !== results[0].item);
      await this.db?.push(path, filtered, true);
      return results[0].item;
    } catch (err) {
      store.modules.logger.error(err as string);
      return undefined;
    }
  }

  /**
   * Get count of array items
   * @param {string} path Path of array to count in db
   * @returns {number} Number of items in array, or -1 on error
   */
  count = async (path: string): Promise<number> =>
      await this.db?.exists(path) ? await this.db?.count(path) ?? 0 : 0;

  /**
   * Check if DbUtils has run `setup()` and is able to handle commands
   * @returns {boolean} `true` if DbUtils has run `setup()` and is able to handle commands
   */
  isReady = (): boolean => this.ready;

  isInBounds = async (path: string, index?: number): Promise<boolean> =>
    index != undefined
    && await this.count(path) > index;
}
