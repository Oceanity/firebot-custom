import DbUtils from "@u/dbUtils";
import axios from "axios";
import store from "@u/global";
import Fuse from "fuse.js";

export default class BirdFactTopicUtils {
  private readonly db: DbUtils;
  private readonly path: string = "/topics";

  constructor() {
    this.db = new DbUtils("./db/birbFactTopics.db");
  }

  //#region Class Methods
  setup = async (): Promise<void> => {
    await this.db.setup();
  }

  get = async (): Promise<string | undefined> =>
    await this.db.getRandom<string>(this.path, []);

  getAll = async (): Promise<string[]> =>
    await this.db.get<string[]>(this.path, []) ?? [];

  push = async (topic: string): Promise<boolean> =>
    await this.db.push<string>(this.path, topic);

  update = async (search: string, replace: string): Promise<boolean> => {
    const data = await this.db.get<string[]>(this.path) ?? []
    const fuse = new Fuse(data)
    const results = fuse.search(search);
    if (!results || !results.length) throw `Can't find Topic to update with search ${search}`;
    data[results[0].refIndex] = replace;
    return await this.db.push<string[]>(this.path, data, true);
  }
  //#endregion

  //#region Static Methods
  static fetch = async (): Promise<string | undefined> =>
    (await axios.get<string>(`${store.firebotApiBase}/birdFacts/topics`, {
      headers: {
        "Content-Length": 0,
        "Content-Type": "text/plain"
      },
      responseType: "text"
    })).data;
  //#endregion
}
