import BirdFactUtils from "@/utils/birdFactUtils";
import MastodonUtils from "@/utils/mastodonUtils";
import { Request, Response } from "express";
import store from "@u/global";

export default class MastodonApi {
  private static readonly apiBase: string = "/mastodon";

  private readonly birdFact: BirdFactUtils;
  private readonly mastodon: MastodonUtils;
  private readonly accessTokenVar: string = "MASTODON_ACCESS_TOKEN";

  constructor() {
    const accessToken = process.env[this.accessTokenVar];
    if (!accessToken) throw "Cannot get Access Token from .env";

    this.birdFact = new BirdFactUtils("./db/mastodonBirbFacts.db");
    this.mastodon = new MastodonUtils({ apiBase: "https://botsin.space/api", accessToken: accessToken ?? "" });
  }

  setup = async(): Promise<void> => {
    await this.birdFact.setup();
    await this.registerEndpoints();
  }

  private registerEndpoints = async (): Promise<boolean> => {
    const { modules, prefix } = store;
    const { httpServer } = modules;

    let result = true;
    result &&= httpServer.registerCustomRoute(prefix, `${MastodonApi.apiBase}/birbFact`, "POST", this.postBirbFactHandler);

    return result;
  }

  private postBirbFactHandler = async (req: Request, res: Response): Promise<void> => {
    const fact = await this.birdFact.putBirdFact();
    const attachments = [];
    if (fact.iNatData) {
      attachments.push({
        url: fact.iNatData.photo_url,
        description: `Photo of a ${fact.bird.name}`
      });
    }

    const status = this.mastodon.formatBirbFactStatus(fact);
    const response = await this.mastodon.postNewMessage(status, attachments);

    res.send(response);
  }
}
