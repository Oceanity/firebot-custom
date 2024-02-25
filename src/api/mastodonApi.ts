import BirdFactUtils from "@u/birdFactUtils";
import MastodonUtils from "@u/mastodonUtils";
import { Request, Response } from "express";
import env from "@u/envUtils";
import store from "@u/store";

export default class MastodonApi {
  private static readonly apiBase: string = "/mastodon";

  private readonly birdFact: BirdFactUtils;
  private readonly mastodon: MastodonUtils;
  private readonly accessTokenVar: string = "BOTSINSPACE_ACCESS_TOKEN";

  constructor() {
    const accessToken = env.getEnvVarOrThrow("BOTSINSPACE_ACCESS_TOKEN");
    if (!accessToken) throw "Cannot get Access Token from .env";

    this.birdFact = new BirdFactUtils();
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
    store.modules.logger.info("Posting birb fact to Mastodon...");
    const idResponse = await fetch(`${store.firebotApiBase}/mastodon/birdFacts/nextId`);
    const id = (await idResponse.json()).id ?? 1;
    const fact = await this.birdFact.createNew(id);
    store.modules.logger.info(`Birb Fact #${fact.id}: ${fact.message} (topic ${fact.topic})`);
    const attachments = [];
    if (fact.iNatData) {
      attachments.push({
        url: fact.iNatData.photo_url,
        description: `Photo of a ${fact.bird.name}`
      });
    }

    const status = [
        `🐦 Birb Fact #${fact.id}`,
        "────────────────────────────",
        [
          `${fact.bird.name} (${fact.bird.sciName})`,
          `${fact.message}`,
          `${fact.iNatData ? `📸 ${fact.iNatData.photo_attribution}` : ""}`
        ].join("\n\n")
      ].join("\n").trim();

    const response = await MastodonUtils.postNewMessage(store.getBotsinSpaceContext(), status, attachments);
    if (!response) throw "Failed to post new birb fact to Mastodon";

    await fetch(`${store.firebotApiBase}/mastodon/birdFacts/nextId`, {
      method: "POST"
    });

    res.send(response);
  }
}
