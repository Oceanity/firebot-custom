import { ensureDir } from "fs-extra";
import { join, dirname } from "path";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { JsonDB } from "node-json-db";

export default class DbUtils {
  private readonly path: string;
  private readonly modules: ScriptModules;
  private readonly dir: string;

  private db: JsonDB;
  private ready: boolean = false;

  /**
   * Instantiates DbUtils class
   * @param {string} path The relative path to the created .db file
   * @param {ScriptModules} modules ScriptModules reference for logging
   */
  constructor(path: string = "./db/database.db", modules: ScriptModules) {
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
   * @param {string} path Path of db to pull data from
   * @param {T?} defaults Default data (optional) to fill db at path if none found
   * @returns {T} Returns data <T> stored in the loaded db at the given path
   */
  public async get<T>(path: string, defaults?: T): Promise<T> {
    const { logger } = this.modules;
    try {
      return this.db.getData(path) as T;
    } catch (err) {
      if (defaults) this.db.push(path, defaults, true);
      logger.error(err);
    }
  }

  /**
   * Check if DbUtils has run `setup()` and is able to handle commands
   * @returns {boolean} `true` if DbUtils has run `setup()` and is able to handle commands
   */
  public isReady = (): boolean => this.ready;
}
