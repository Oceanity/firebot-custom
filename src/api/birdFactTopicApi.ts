import BirdFactTopicUtils from "@u/birdFactTopicUtils";
import { Request, Response } from "express";
import store from "@u/store";
import { CreateTopicRequest, UpdateTopicRequest } from "@t/birdFacts";

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

  private registerEndpoints = async (): Promise<void> => {
    const { route } = this;
    const { modules, prefix } = store;
    const { httpServer } = modules;

    let result = true;

    result &&= httpServer.registerCustomRoute(prefix, route, "GET", this.getRandomTopicHandler);
    result &&= httpServer.registerCustomRoute(prefix, `${route}/all`, "GET", this.getAllTopicsHandler);
    result &&= httpServer.registerCustomRoute(prefix, route, "PUT", this.putHandler);
    result &&= httpServer.registerCustomRoute(prefix, route, "PATCH", this.patchHandler);
    // result &&= httpServer.registerCustomRoute(prefix, `${route}/delete`, "POST", this.deleteTopicHandler);

    if (!result) throw "Could not register all endpoints for Birb Fact Topics API";
  }

  private getAllTopicsHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.topics.getAll());
  }

  private getRandomTopicHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.topics.get());
  }

  private putHandler = async (req: Request, res: Response): Promise<void> => {
    const { topic } = req.body as CreateTopicRequest;
    res.send(await this.topics.push(topic));
  }

  private patchHandler = async (req: Request, res: Response): Promise<void> => {
    const { search, replace } = req.body as UpdateTopicRequest;
    res.send(await this.topics.update(search, replace));
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
}
