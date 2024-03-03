import { Request, Response } from "express";
import { CreateTopicRequest } from "@t/birdFacts";
import topics from "@u/birdFactTopicUtils";
import api from "@u/apiUtils";

export default class BirdFactTopicApi {
  private static readonly route: string = "/birdFacts/topics";

  static registerEndpoints() {
    api.registerAllEndpoints(
      [
        [this.route, "GET", this.getRandomTopicHandler],
        [`${this.route}/all`, "GET", this.getAllTopicsHandler],
        [this.route, "PUT", this.addTopicHandler],
        // [this.route,           "PATCH",  this.patchHandler],
      ],
      "Bird Fact Topic",
    );
  }

  private static async getRandomTopicHandler(req: Request, res: Response) {
    res.send(await topics.getRandomTopicAsync());
  }

  private static async getAllTopicsHandler(req: Request, res: Response) {
    res.send(await topics.getAllTopicsAsync());
  }

  private static async addTopicHandler(req: Request, res: Response) {
    const { topic } = req.body as CreateTopicRequest;
    res.send(await topics.addTopicAsync(topic));
  }

  // private static async patchHandler(req: Request, res: Response) {
  //   const { search, replace } = req.body as UpdateTopicRequest;
  //   res.send(await this.topics.update(search, replace));
  // }

  // private static async putTopicHandler(req: Request, res: Response)  {
  //   try {
  //     const { topic } = req.body as CreateTopicRequest;
  //     res.send(await this.birdFactUtils.pushTopic(topic));
  //     return true;
  //   } catch (err) {
  //     return endpointErrorHandler(store.modules.logger, err, res);
  //   }
  // }

  // private static async deleteTopicHandler(req: Request, res: Response) {
  //   try {
  //     const { topic } = req.body as DeleteTopicRequest;
  //     res.send(await this.birdFactUtils.deleteTopic(topic));
  //     return true;
  //   } catch (err) {
  //     return endpointErrorHandler(store.modules.logger, err, res);
  //   }
  // }
}
