import { Request, Response } from "express";
import loadingMessages from "@u/birdFactLoadingMessageUtils";
import { CreateLoadingMessageRequest } from "@t/birdFacts";
import api from "@u/apiUtils";

export default class BirdFactLoadingMessageApi {
  private static readonly route = "/birdFacts/loadingMessages";

  static registerEndpoints() {
    api.registerAllEndpoints(
      [
        [this.route, "GET", this.getMessageHandler],
        [`${this.route}/all`, "GET", this.getAllMessagesHandler],
        [this.route, "PUT", this.addMessageHandler],
        // [this.route, "PATCH", this.updateHandler],
        // [`${this.route}/delete`, "POST", this.deleteHandler],
      ],
      "Bird Fact Loading Message",
    );
  }

  private static async getMessageHandler(req: Request, res: Response) {
    res.send(await loadingMessages.getRandomMessageAsync());
  }

  private static async getAllMessagesHandler(req: Request, res: Response) {
    res.send(await loadingMessages.getAllMessagesAsync());
  }

  private static async addMessageHandler(req: Request, res: Response) {
    const { message } = req.body as CreateLoadingMessageRequest;
    res.send(await loadingMessages.addMessageAsync(message));
  }

  // private static async updateHandler(req: Request, res: Response) {
  //   const { search, replace } = req.body as UpdateLoadingMessageRequest;
  //   res.send(await loadingMessages.update(search, replace));
  // }

  // private static async deleteHandler(req: Request, res: Response) {
  //   const { search } = req.body as DeleteLoadingMessageRequest;
  //   res.send(await loadingMessages.delete(search));
  // }
}
