import { JsonDB } from "node-json-db";
import store from "@u/store";
import { ensureDir } from "fs-extra";
import { dirname, resolve } from "path";
import { getRandomInteger } from "./numbers";
import { PatchResults } from "@t/db";
import Fuse, { IFuseOptions } from "fuse.js";

export default class StaticDbUtils {
  static setup = async (path: string = "./db/firebotDb"): Promise<JsonDB> => {
    const { JsonDb } = store.modules;

    if (!path.includes(__dirname)) path = resolve(__dirname, path);

    await ensureDir(dirname(path));

    //@ts-expect-error 18046
    return new JsonDb(path, true, true);
  };

  static getAsync = async <T>(path: string, route: string, defaults?: T | T[]): Promise<T | undefined> => {
    const db = await this.setup(path);

    try {
      return db.getData(route) as T;
    } catch (err) {
      if (defaults) db.push(route, defaults, true);
      store.modules.logger.error(`Failed to get "${route}" from "${path}"`);
      return undefined;
    }
  };

  static getRandom = async <T>(path: string, route: string, defaults?: T[]): Promise<T | undefined> => {
    const choices = await this.getAsync<T[]>(path, route, defaults);

    if (!choices || !choices.length) {
      store.modules.logger.error(`Failed to get random "${route}" from "${path}"`);
      return undefined;
    }

    const random = getRandomInteger(choices.length - 1);
    return choices[random];
  };

  static push = async <T>(path: string, route: string, data: T, override: boolean = false): Promise<boolean> => {
    const db = await this.setup(path);
    store.modules.logger.info(`Pushing ${JSON.stringify(data)} to ${route} in ${path}`);

    try {
      await db.push(route, data, override);
      return true;
    } catch (err) {
      store.modules.logger.error(`Could not push to "${route}" in "${path}"`);
      return false;
    }
  };

  static update = async <T>(
    path: string,
    route: string,
    search: string,
    replace: T,
    fuseOptions?: IFuseOptions<T>,
  ): Promise<PatchResults<T> | undefined> => {
    const db = await this.setup(path);

    try {
      const data = await db.getData(route);
      const fuse = new Fuse(data, fuseOptions);
      const results = fuse.search(search);

      if (!results) {
        store.modules.logger.error("Could not find item to update");
        return undefined;
      }

      db.push(`${route}[${results[0].refIndex}]`, replace);

      return {
        found: results[0].item,
        replaced: replace,
      };
    } catch (err) {
      store.modules.logger.error(`Failed to update "${route}" in "${path}"`);
      return undefined;
    }
  };
}
