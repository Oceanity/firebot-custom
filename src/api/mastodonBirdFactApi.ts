import { Request, Response } from "express";
import api from "@u/apiUtils";
import mastodonBirdFacts from "@u/mastodonBirdFactUtils";

export default class MastodonBirdFactApi {
  private static readonly route: string = "/mastodon/birdFacts";

  static registerEndpoints() {
    api.registerAllEndpoints(
      [
        [this.route, "POST", this.postNewFactHandler],
        [`${this.route}/nextId`, "GET", this.getNextIdHandler],
        [`${this.route}/nextId`, "POST", this.incrementNextIdHandler],
      ],
      "Mastodon Bird Fact",
    );
  }

  private static async postNewFactHandler(req: Request, res: Response) {
    res.send(await mastodonBirdFacts.postNewFactAsync());
  }

  private static async getNextIdHandler(req: Request, res: Response) {
    res.send({ id: await mastodonBirdFacts.getNextBirdFactIdAsync() });
  }

  private static async incrementNextIdHandler(req: Request, res: Response) {
    res.send(await mastodonBirdFacts.pushNextBirdFactIdAsync());
  }
}
