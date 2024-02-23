import NuthatchUtils from "@/utils/nuthatchUtils";
import { Request, Response } from "express";
import { getRequestDataFromUri } from "@/utils/requestUtils";
import BirdFactUtils from "@/utils/birdFactUtils";
import store from "@u/global";

export default class BirdFactApi {
  private static readonly route: string= "/birdFacts";

  private readonly birdFactUtils: BirdFactUtils;
  private readonly nuthatchUtils: NuthatchUtils;

  constructor() {
    this.birdFactUtils = new BirdFactUtils();
    this.nuthatchUtils = new NuthatchUtils();
  }

  setup = async () => {
    store.modules.logger.info("Setting up BirdFactApi...");
    await this.birdFactUtils.setup();
    await this.nuthatchUtils.setup();
    await this.registerEndpoints();
  }

  private registerEndpoints = async () => {
    const { route } = BirdFactApi;
    const { modules, prefix } = store;
    const { httpServer } = modules;

    // Birb Fact Endpoints
    httpServer.registerCustomRoute(prefix, route, "GET", this.getBirdFactHandler);
    httpServer.registerCustomRoute(prefix, `${route}/all`, "GET", this.getAllBirdFactsHandler);
    httpServer.registerCustomRoute(prefix, route, "PUT", this.putNewBirdFactHandler);
  }

  //#region Bird Fact Handlers
  private getBirdFactHandler = async (req: Request, res: Response) => {
    const { id } = getRequestDataFromUri(req.url).params;
    res.send(await this.birdFactUtils.getBirdFact(parseInt(id)));
  }

  private getAllBirdFactsHandler = async (req: Request, res: Response) =>
    res.send(await this.birdFactUtils.getAllBirdFacts());

  private putNewBirdFactHandler = async (req: Request, res: Response) =>
    res.send(await this.birdFactUtils.putBirdFact());
  //#endregion
}
