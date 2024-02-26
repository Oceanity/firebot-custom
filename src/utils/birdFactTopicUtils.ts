import DbUtils from "@u/dbUtils";
import axios from "axios";
import store from "@u/store";
import { PatchResults } from "@t/db";

export default class BirdFactTopicUtils {
  private readonly db: DbUtils;
  private readonly path: string = "/topics";

  constructor() {
    this.db = new DbUtils("./db/birbFactTopics");
  }

  setup = async (): Promise<void> => {
    await this.db.setup();
  }

  get = async (): Promise<string> =>
    await this.db.getRandom<string>(this.path, []) ?? "most interesting features";

  getAll = async (): Promise<string[]> =>
    await this.db.get<string[]>(this.path, []) ?? [];

  push = async (topic: string): Promise<boolean> =>
    await this.db.push<string>(this.path, topic);

  update = async (search: string, replace: string): Promise<PatchResults<string> | undefined> =>
    await this.db.update<string>(this.path, search, replace);

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
