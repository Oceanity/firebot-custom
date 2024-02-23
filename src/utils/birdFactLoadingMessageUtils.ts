import DbUtils from "./dbUtils";

export default class BirdFactLoadingMessageUtils {
  private readonly db: DbUtils;
  private readonly path: string = "/loadingMessages";

  constructor() {
    this.db = new DbUtils("./db/birbFactLoadingMessages.db");
  }

  setup = async (): Promise<void> => {
    await this.db.setup();
  }

  //#region Public Functions
  get = async (): Promise<string> =>
    await this.db.getRandom<string>(this.path) ?? "Generating new birb fact...";

  getAll = async (): Promise<string[]> =>
    await this.db.get<string[]>(this.path, []) ?? [];

  push = async (loadingMessage: string): Promise<boolean> =>
    await this.db.push<string>(this.path, loadingMessage);

  update = async (search: string, replace: string): Promise<string | undefined> =>
    await this.db.update<string>(this.path, search, replace);

  delete = async (search: string): Promise<string | undefined> =>
    await this.db.delete<string>(this.path, search);
  //#endregion
}
