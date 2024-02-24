import DbUtils from "@u/dbUtils";
import axios from "axios";
import store from "@u/store";

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

  get = async (): Promise<string> =>
    await this.db.getRandom<string>(this.path, []) ?? "most interesting features";

  getAll = async (): Promise<string[]> =>
    await this.db.get<string[]>(this.path, []) ?? [];

  push = async (topic: string): Promise<boolean> =>
    await this.db.push<string>(this.path, topic);
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
