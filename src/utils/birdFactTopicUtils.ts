import DbUtils from "@u/dbUtils";
// import store from "@u/global";

export default class BirdFactTopicUtils {
  private readonly db: DbUtils;
  private readonly path: string = "/topics";

  constructor() {
    this.db = new DbUtils("./db/birbFactTopics.db");
  }

  setup = async (): Promise<void> => {
    await this.db.setup();
  }

  get = async (): Promise<string | undefined> =>
    await this.db.getRandom<string>(this.path, []);

  getAll = async (): Promise<string[]> =>
    await this.db.get<string[]>(this.path, []) ?? [];

  push = async (topic: string): Promise<boolean> =>
    await this.db.push<string>(this.path, topic);
}
