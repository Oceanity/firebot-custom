import NuthatchUtils from "@/utils/nuthatchUtils";
import { Request, Response } from "express";
import {
  CreateLoadingMessageRequest,
  UpdateLoadingMessageRequest,
  DeleteLoadingMessageRequest,
} from "@t/birdFacts";
import { endpointErrorHandler, getRequestDataFromUri } from "@/utils/requestUtils";
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
    httpServer.registerCustomRoute(prefix, route, "PUT", this.putNewBirdFactHandler);
    httpServer.registerCustomRoute(prefix, route, "GET", this.getBirdFactHandler);
    httpServer.registerCustomRoute(prefix, `${route}/all`, "GET", this.getAllBirdFactsHandler);

    // Loading Message Endpoints
    httpServer.registerCustomRoute(prefix, `${route}/loadingMessages`, "PUT", this.putLoadingMessageHandler);
    httpServer.registerCustomRoute(prefix, `${route}/loadingMessages`, "GET", this.getRandomLoadingMessageHandler);
    httpServer.registerCustomRoute(prefix, `${route}/loadingMessages/all`, "GET", this.getAllLoadingMessagesHandler);
    httpServer.registerCustomRoute(prefix, `${route}/loadingMessages`, "PATCH", this.updateLoadingMessageHandler);
    httpServer.registerCustomRoute(prefix, `${route}/loadingMessages/delete`, "POST", this.deleteLoadingMessageHandler);

    // Topic Endpoints
    // httpServer.registerCustomRoute(prefix, `${route}/topics`, "PUT", this.putTopicHandler);
    // httpServer.registerCustomRoute(prefix, `${route}/topics`, "GET", this.getRandomTopicHandler);
    // httpServer.registerCustomRoute(prefix, `${route}/topics/all`, "GET", this.getAllTopicsHandler);
    // httpServer.registerCustomRoute(prefix, `${route}/topics/delete`, "POST", this.deleteTopicHandler);
  }

  //#region Bird Fact Handlers
  private putNewBirdFactHandler = async (req: Request, res: Response) =>
    res.send(await this.birdFactUtils.putBirdFact());

  private getAllBirdFactsHandler = async (req: Request, res: Response) =>
    res.send(await this.birdFactUtils.getAllBirdFacts());

  private getBirdFactHandler = async (req: Request, res: Response) => {
    const { id } = getRequestDataFromUri(req.url).params;
    res.send(await this.birdFactUtils.getBirdFact(parseInt(id)));
  }
  //#endregion

  //#region Loading Message Handlers
  private getAllLoadingMessagesHandler = async (req: Request, res: Response) => {
    const response = await this.birdFactUtils.getAllLoadingMessages();
    res.send(response);
    return response;
  }

  private getRandomLoadingMessageHandler = async (req: Request, res: Response): Promise<string> => {
    const response = await this.birdFactUtils.getRandomLoadingMessage();
    res.send(response);
    return response;
  }

  private putLoadingMessageHandler = async (req: Request, res: Response): Promise<boolean> => {
    const { message } = req.body as CreateLoadingMessageRequest;
    const response = await this.birdFactUtils.pushLoadingMessage(message);
    res.send(response);
    return response;
  }

  private updateLoadingMessageHandler = async (req: Request, res: Response): Promise<boolean> => {
    const { oldMessage, newMessage } = req.body as UpdateLoadingMessageRequest;
    const response = await this.birdFactUtils.updateLoadingMessage(oldMessage, newMessage);
    res.send(response);
    return response;
  }

  private deleteLoadingMessageHandler = async (req: Request, res: Response): Promise<boolean> => {
    try {
      const { message } = req.body as DeleteLoadingMessageRequest;
      res.send(await this.birdFactUtils.deleteLoadingMessage(message));
      return true;
    } catch(err) {
      return endpointErrorHandler(store.modules.logger, err, res);
    }
  }
  //#endregion
}
