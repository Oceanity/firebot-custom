import { Request, Response } from "express";
import { getRequestDataFromUri } from "@/utils/requestUtils";
import BirdFactUtils from "@/utils/birdFactUtils";
import store from "@u/global";

export default class BirdFactApi {
  private readonly birdFactUtils: BirdFactUtils;
  private readonly route: string= "/birdFacts";

  constructor() {
    this.birdFactUtils = new BirdFactUtils();
  }

  setup = async (): Promise<void> => {
    await this.birdFactUtils.setup();
    await this.registerEndpoints();
  }

  private registerEndpoints = async (): Promise<boolean> => {
    const { route } = this;
    const { modules, prefix } = store;
    const { httpServer } = modules;

    let response = true;

    // Birb Fact Endpoints
    response &&= httpServer.registerCustomRoute(prefix, route, "GET", this.getHandler);
    response &&= httpServer.registerCustomRoute(prefix, `${route}/all`, "GET", this.getAllHandler);
    response &&= httpServer.registerCustomRoute(prefix, route, "PUT", this.putHandler);

    return response;
  }

  //#region Endpoints Handlers
  private getHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = getRequestDataFromUri(req.url).params;
    res.send(await this.birdFactUtils.getBirdFact(parseInt(id)));
  }

  private getAllHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.birdFactUtils.getAllBirdFacts());
  }

  private getNewHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.birdFactUtils.getNewBirdFact());
  }

  private putHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.birdFactUtils.putBirdFact());
  }
  //#endregion
}
