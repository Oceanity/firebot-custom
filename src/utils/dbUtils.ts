import { ensureDir } from "fs-extra";
import { join, dirname } from "path";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { JsonDB } from "node-json-db";

export default class DbHelper {
  private readonly path: string;
  private readonly modules: ScriptModules;
  private readonly dir: string;

  private db: JsonDB;

  /**
   * Instantiates DbHelper class
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

    //@ts-ignore
    this.db = new JsonDb(this.path, true, true);
  }
}
