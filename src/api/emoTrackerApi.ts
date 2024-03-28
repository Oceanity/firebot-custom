import { Request, Response } from "express";
import api from "@u/apiUtils";
import emoTrackerUtils from "@u/emoTrackerUtils";

export default class EmoTrackerApi {
  private static readonly route: string = "/emoTracker";

  static registerEndpoints() {
    api.registerAllEndpoints(
      [
        [this.route, "GET", this.getAllGamesHandler],
        [`${this.route}/search`, "POST", this.searchItemHandler],
      ],
      "EmoTracker",
    );
  }

  private static async getAllGamesHandler(req: Request, res: Response) {
    res.send(await emoTrackerUtils.getAllGameItemsAsync());
  }

  private static async searchItemHandler(req: Request, res: Response) {
    const { game, search } = req.body as SearchItemRequest;

    if (!game || !search) {
      res.status(400);
      res.send("Missing game or search in request body");
      return;
    }

    res.send(await emoTrackerUtils.findItemSlug(game, search));
  }
}

type SearchItemRequest = {
  game: string;
  search: string;
};
