import BirdFactTopicUtils from "@/utils/birdFactTopicUtils";
import { Request, Response } from "express";
import store from "@u/global";

export default class BirdFactTopicApi {
  private readonly route: string = "/birdFacts/topics";
  private readonly topics: BirdFactTopicUtils;

  constructor() {
    this.topics = new BirdFactTopicUtils();
  }

  setup = async (): Promise<void> => {
    await this.topics.setup();
    await this.registerEndpoints();
  }

  private registerEndpoints = async (): Promise<boolean> => {
    const { route } = this;
    const { modules, prefix } = store;
    const { httpServer } = modules;

    let result = true;
    // Topic Endpoints
    // result &&= httpServer.registerCustomRoute(prefix, route, "PUT", this.putTopicHandler);
    result &&= httpServer.registerCustomRoute(prefix, route, "GET", this.getRandomTopicHandler);
    result &&= httpServer.registerCustomRoute(prefix, `${route}/all`, "GET", this.getAllTopicsHandler);
    // result &&= httpServer.registerCustomRoute(prefix, `${route}/delete`, "POST", this.deleteTopicHandler);
    return result;
  }

  //#region Topic Handlers
  private getAllTopicsHandler = async (req: Request, res: Response): Promise<boolean> => {
    const topics = await this.topics.getAll();
    res.send(topics);
    return true;
  }

  private getRandomTopicHandler = async (req: Request, res: Response): Promise<boolean> => {
    const topic = await this.topics.get();
    res.send(topic);
    return true;
  }

  // private putTopicHandler = async (req: Request, res: Response): Promise<boolean> => {
  //   try {
  //     const { topic } = req.body as CreateTopicRequest;
  //     res.send(await this.birdFactUtils.pushTopic(topic));
  //     return true;
  //   } catch (err) {
  //     return endpointErrorHandler(store.modules.logger, err, res);
  //   }
  // }

  // private deleteTopicHandler = async (req: Request, res: Response): Promise<boolean> => {
  //   try {
  //     const { topic } = req.body as DeleteTopicRequest;
  //     res.send(await this.birdFactUtils.deleteTopic(topic));
  //     return true;
  //   } catch (err) {
  //     return endpointErrorHandler(store.modules.logger, err, res);
  //   }
  // }
  //#endregion
}
