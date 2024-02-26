import { Request, Response } from "express";
import DbUtils from "@u/dbUtils";
import store from "@u/store";

export default class MastodonBirdFactApi {
  private readonly db: DbUtils;
  private readonly route: string = "/mastodon/birdFacts";

  constructor() {
    this.db = new DbUtils("./db/mastodon");
  }

  setup = async (): Promise<void> => {
    const { modules, prefix } = store;
    const { httpServer } = modules;

    await this.db.setup();

    let response = true;

    response &&= httpServer.registerCustomRoute(prefix, `${this.route}/nextId`, "GET", this.getNextIdHandler);
    response &&= httpServer.registerCustomRoute(prefix, `${this.route}/nextId`, "POST", this.incrementNextIdHandler);

    if (!response) throw "Could not register all endpoints for Mastodon Birb Fact Api";
  }

  private getNextIdHandler = async (req: Request, res: Response): Promise<void> => {
    const id = await this.db.get<number>("/nextBirdFactId") ?? 1;
    res.send({ id });
  }

  private incrementNextIdHandler = async (req: Request, res: Response): Promise<void> => {
    const id = await this.db.get<number>("/nextBirdFactId", 1) ?? 0;
    res.send(await this.db.set<number>("/nextBirdFactId", id + 1));
  }
}
