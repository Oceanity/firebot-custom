import NuthatchUtils from "@/utils/nuthatchUtils";
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import {
  CreateLoadingMessageRequest,
  UpdateLoadingMessageRequest,
  DeleteLoadingMessageRequest,
  CreateTopicRequest,
  DeleteTopicRequest
} from "@t/birdFacts";
import { endpointErrorHandler, getRequestDataFromUri } from "@/utils/requestUtils";
import BirdFactUtils from "@/utils/birdFactUtils";
import Api from "./apiCommon";
dotenv.config({ path: __dirname + '/.env' });
import store from "@u/global";

export default class BirdFactApi {
  private readonly birdFactUtils: BirdFactUtils;
  private readonly nuthatchUtils: NuthatchUtils;
  private readonly base: string;

  constructor() {
    this.birdFactUtils = new BirdFactUtils();
    this.nuthatchUtils = new NuthatchUtils();

    this.base = "/birdFacts";
  }

  public setup = async () => {
    store.modules.logger.info("Setting up BirdFactApi...");
    await this.birdFactUtils.setup();
    await this.nuthatchUtils.setup();
    await this.registerEndpoints();
  }

  private registerEndpoints = async () => {
    const { base } = this;
    const { httpServer } = store.modules;

    // Birb Fact Endpoints
    httpServer.registerCustomRoute(Api.prefix, base, "PUT", this.putNewBirdFactHandler);
    httpServer.registerCustomRoute(Api.prefix, base, "GET", this.getBirdFactHandler);
    httpServer.registerCustomRoute(Api.prefix, `${base}/all`, "GET", this.getAllBirdFactsHandler);

    // Loading Message Endpoints
    httpServer.registerCustomRoute(Api.prefix, `${base}/loadingMessages`, "PUT", this.putLoadingMessageHandler);
    httpServer.registerCustomRoute(Api.prefix, `${base}/loadingMessages`, "GET", this.getRandomLoadingMessageHandler);
    httpServer.registerCustomRoute(Api.prefix, `${base}/loadingMessages/all`, "GET", this.getAllLoadingMessagesHandler);
    httpServer.registerCustomRoute(Api.prefix, `${base}/loadingMessages`, "PATCH", this.updateLoadingMessageHandler);
    httpServer.registerCustomRoute(Api.prefix, `${base}/loadingMessages/delete`, "POST", this.deleteLoadingMessageHandler);

    // Topic Endpoints
    httpServer.registerCustomRoute(Api.prefix, `${base}/topics`, "PUT", this.putTopicHandler);
    httpServer.registerCustomRoute(Api.prefix, `${base}/topics`, "GET", this.getRandomTopicHandler);
    httpServer.registerCustomRoute(Api.prefix, `${base}/topics/all`, "GET", this.getAllTopicsHandler);
    httpServer.registerCustomRoute(Api.prefix, `${base}/topics/delete`, "POST", this.deleteTopicHandler);
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

  //#region Topic Handlers
  private getAllTopicsHandler = async (req: Request, res: Response): Promise<boolean> => {
    try {
      const topics = await this.birdFactUtils.getAllTopics();
      res.send(topics);
      return true;
    } catch(err) {
      return endpointErrorHandler(store.modules.logger, err, res);
    }
  }

  private getRandomTopicHandler = async (req: Request, res: Response): Promise<boolean> => {
    try {
      const topic = await this.birdFactUtils.getRandomTopic();
      res.send(topic);
      return true;
    } catch (err) {
      return endpointErrorHandler(store.modules.logger, err, res);
    }
  }

  private putTopicHandler = async (req: Request, res: Response): Promise<boolean> => {
    try {
      const { topic } = req.body as CreateTopicRequest;
      res.send(await this.birdFactUtils.pushTopic(topic));
      return true;
    } catch (err) {
      return endpointErrorHandler(store.modules.logger, err, res);
    }
  }

  private deleteTopicHandler = async (req: Request, res: Response): Promise<boolean> => {
    try {
      const { topic } = req.body as DeleteTopicRequest;
      res.send(await this.birdFactUtils.deleteTopic(topic));
      return true;
    } catch (err) {
      return endpointErrorHandler(store.modules.logger, err, res);
    }
  }
  //#endregion
}
