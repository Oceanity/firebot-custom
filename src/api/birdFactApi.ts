import NuthatchUtils from "@/utils/nuthatchUtils";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import OpenApiUtils from "@/utils/openAiUtils";
import {
  CreateLoadingMessageRequest,
  UpdateLoadingMessageRequest,
  DeleteLoadingMessageRequest,
  CreateTopicRequest,
  DeleteTopicRequest
} from "@t/birdFacts";
import { endpointErrorHandler, getRequestDataFromUri } from "@/utils/requestUtils";
import BirdFactUtils from "@/utils/birdFactUtils";
dotenv.config({ path: __dirname + '/.env' });

export default class BirdFactApi {
  private readonly birdFactUtils: BirdFactUtils;
  private readonly nuthatchUtils: NuthatchUtils;
  private readonly openAiUtils: OpenApiUtils;
  private readonly modules: ScriptModules;
  private readonly prefix: string;
  private readonly base: string;

  constructor(modules: ScriptModules) {
    this.birdFactUtils = new BirdFactUtils(modules);
    this.nuthatchUtils = new NuthatchUtils(modules);
    this.openAiUtils = new OpenApiUtils(modules);
    this.modules = modules;

    this.prefix = "oceanity";
    this.base = "/birdFacts";
  }

  public setup = async () => {
    this.modules.logger.info("Setting up BirdFactApi...");
    await this.birdFactUtils.setup();
    await this.nuthatchUtils.setup();
    await this.registerEndpoints();
  }

  private registerEndpoints = async () => {
    const { modules, prefix, base } = this;
    const { httpServer } = modules;

    // Birb Fact Endpoints
    httpServer.registerCustomRoute(prefix, base, "PUT", this.putNewBirdFactHandler);
    httpServer.registerCustomRoute(prefix, base, "GET", this.getBirdFactHandler);

    // Loading Message Endpoints
    httpServer.registerCustomRoute(prefix, `${base}/loadingMessages`, "PUT", this.putLoadingMessageHandler);
    httpServer.registerCustomRoute(prefix, `${base}/loadingMessages`, "GET", this.getRandomLoadingMessageHandler);
    httpServer.registerCustomRoute(prefix, `${base}/loadingMessages/all`, "GET", this.getAllLoadingMessagesHandler);
    httpServer.registerCustomRoute(prefix, `${base}/loadingMessages`, "PATCH", this.updateLoadingMessageHandler);
    httpServer.registerCustomRoute(prefix, `${base}/loadingMessages`, "DELETE", this.deleteLoadingMessageHandler);

    // Topic Endpoints
    httpServer.registerCustomRoute(prefix, `${base}/topics`, "PUT", this.putTopicHandler);
    httpServer.registerCustomRoute(prefix, `${base}/topics`, "GET", this.getRandomTopicHandler);
    httpServer.registerCustomRoute(prefix, `${base}/topics/all`, "GET", this.getAllTopicsHandler);
    httpServer.registerCustomRoute(prefix, `${base}/topics`, "DELETE", this.deleteTopicHandler);
  }

  //#region Bird Fact Handlers
  private putNewBirdFactHandler = async (req: Request, res: Response) => {
    const bird = await this.nuthatchUtils.getRandomBird();
    const topic = await this.birdFactUtils.getRandomTopic();
    const newFact = await this.birdFactUtils.putBirdFact(this.openAiUtils, bird, topic);
    res.send(newFact);
  }

  private getBirdFactHandler = async (req: Request, res: Response) => {
    const { id } = getRequestDataFromUri(req.url).params;
    const fact = await this.birdFactUtils.getBirdFact(parseInt(id));
    res.send(fact);
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
    const { message } = req.body as DeleteLoadingMessageRequest;
    const response = await this.birdFactUtils.deleteLoadingMessage(message);
    res.send(response);
    return response;
  }
  //#endregion

  //#region Topic Handlers
  private getAllTopicsHandler = async (req: Request, res: Response): Promise<boolean> => {
    try {
      const topics = await this.birdFactUtils.getAllTopics();
      res.send(topics);
      return true;
    } catch(err) {
      return endpointErrorHandler(this.modules.logger, err, res);
    }
  }

  private getRandomTopicHandler = async (req: Request, res: Response): Promise<boolean> => {
    try {
      const topic = await this.birdFactUtils.getRandomTopic();
      res.send(topic);
      return true;
    } catch (err) {
      return endpointErrorHandler(this.modules.logger, err, res);
    }
  }

  private putTopicHandler = async (req: Request, res: Response): Promise<boolean> => {
    try {
      const { topic } = req.body as CreateTopicRequest;
      res.send(await this.birdFactUtils.pushTopic(topic));
      return true;
    } catch (err) {
      return endpointErrorHandler(this.modules.logger, err, res);
    }
  }

  private deleteTopicHandler = async (req: Request, res: Response): Promise<boolean> => {
    try {
      const { topic } = req.body as DeleteTopicRequest;
      res.send(await this.birdFactUtils.deleteTopic(topic));
      return true;
    } catch (err) {
      return endpointErrorHandler(this.modules.logger, err, res);
    }
  }
  //#endregions
}
