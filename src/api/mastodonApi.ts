import BirdFactUtils from "@/utils/birdFactUtils";
import MastodonUtils from "@/utils/mastodonUtils";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { Request, Response } from "express";
import Api from "./apiCommon";

export default class MastodonApi {
  private static readonly apiBase: string = "/mastodon";

  private readonly modules: ScriptModules;
  private readonly birdFact: BirdFactUtils;
  private readonly mastodon: MastodonUtils;
  private readonly accessTokenVar: string = "MASTODON_ACCESS_TOKEN";

  constructor(modules: ScriptModules) {
    const accessToken = process.env[this.accessTokenVar];
    if (!accessToken) throw "Cannot get Access Token from .env";

    this.modules = modules;
    this.birdFact = new BirdFactUtils(modules, "./db/mastodonBirbFacts.db");
    this.mastodon = new MastodonUtils(modules, { apiBase: "https://botsin.space/api", accessToken: accessToken ?? "" });

    modules.httpServer.registerCustomRoute(Api.prefix, `${MastodonApi.apiBase}/birbFact`, "POST", this.postBirbFactHandler);
  }

  public setup = async(): Promise<void> => {
    await this.birdFact.setup();
  }

  private postBirbFactHandler = async (req: Request, res: Response): Promise<boolean> => {
    this.modules.logger.info("Posting birb fact to Mastodon...");
    const fact = await this.birdFact.putBirdFact();
    this.modules.logger.info(JSON.stringify(fact));
    const attachments = [];
    if (fact.iNatData) {
      attachments.push({
        url: fact.iNatData.photo_url,
        description: `Photo of a ${fact.bird.name}`
      });
    }
    this.modules.logger.info(JSON.stringify(attachments));

    const status = `🐦 Birb Fact #${fact.id}\n────────────────────────────\n${fact.bird.name} (${fact.bird.sciName})\n\n\n${fact.message} ${fact.iNatData ? `\n\n\n📸 ${fact.iNatData.photo_attribution}` : ""}`;

    this.modules.logger.info(status);

    const response = await this.mastodon.postNewMessage(status, attachments);

    this.modules.logger.info(`Posted: ${response}`);
    res.send(response);
    return response;
  }
}
