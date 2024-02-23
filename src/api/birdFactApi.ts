import { Request, Response } from "express";
import { getRequestDataFromUri } from "@/utils/requestUtils";
import BirdFactUtils from "@/utils/birdFactUtils";
import store from "@u/global";

export default class BirdFactApi {
  private static readonly route: string= "/birdFacts";
  private readonly birdFactUtils: BirdFactUtils;

  constructor() {
    this.birdFactUtils = new BirdFactUtils();
  }

  setup = async () => {
    store.modules.logger.info("Setting up BirdFactApi...");
    await this.birdFactUtils.setup();
    await this.registerEndpoints();
  }

  private registerEndpoints = async () => {
    const { route } = BirdFactApi;
    const { modules, prefix } = store;
    const { httpServer } = modules;

    // Birb Fact Endpoints
    httpServer.registerCustomRoute(prefix, route, "GET", this.getHandler);
    httpServer.registerCustomRoute(prefix, `${route}/all`, "GET", this.getAllHandler);
    httpServer.registerCustomRoute(prefix, route, "PUT", this.putHandler);
  }

  //#region Endpoints Handlers
  private getHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = getRequestDataFromUri(req.url).params;
    res.send(await this.birdFactUtils.getBirdFact(parseInt(id)));
  }

  private getAllHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.birdFactUtils.getAllBirdFacts());
  }

  private putHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.birdFactUtils.putBirdFact());
  }
  //#endregion
}
