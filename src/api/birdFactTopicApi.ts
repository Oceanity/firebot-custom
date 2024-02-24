import BirdFactTopicUtils from "@/utils/birdFactTopicUtils";
import { Request, Response } from "express";
import store from "@u/global";
import { CreateTopicRequest, UpdateTopicRequest } from "@t/birdFactTopics";

export default class BirdFactTopicApi {
  private readonly topics: BirdFactTopicUtils;
  private readonly route: string = "/birdFacts/topics";

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

    result &&= httpServer.registerCustomRoute(prefix, route, "GET", this.getHandler);
    result &&= httpServer.registerCustomRoute(prefix, `${route}/all`, "GET", this.getAllHandler);
    result &&= httpServer.registerCustomRoute(prefix, route, "PUT", this.putHandler);
    result &&= httpServer.registerCustomRoute(prefix, route, "PATCH", this.patchHandler);
    // result &&= httpServer.registerCustomRoute(prefix, `${route}/delete`, "POST", this.deleteTopicHandler);

    return result;
  }

  //#region Topic Handlers
  private getHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.topics.get());
  }

  private getAllHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.topics.getAll());
  }

  private putHandler = async (req: Request, res: Response): Promise<void> => {
    const { topic } = req.body as CreateTopicRequest;
    res.send(await this.topics.push(topic));
  }

  private patchHandler = async (req: Request, res: Response): Promise<void> => {
    const { search, replace } = req.body as UpdateTopicRequest;
    res.send(await this.topics.update(search, replace))
  }

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
