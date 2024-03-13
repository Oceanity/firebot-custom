import { Request, Response } from "express";
import api from "@u/apiUtils";
import emoTrackerUtils from "@u/emoTrackerUtils";
import { getRequestDataFromUri } from "@/utils/requestUtils";
import store from "@u/store";

export default class EmoTrackerApi {
  private static readonly route: string = "/emoTracker";

  static registerEndpoints() {
    api.registerAllEndpoints(
      [
        [`${this.route}/isConnected`, "GET", this.checkEmoTrackerHandler],
        [`${this.route}/search`, "POST", this.searchItemHandler],
      ],
      "EmoTracker",
    );
  }

  private static async checkEmoTrackerHandler(req: Request, res: Response) {
    const { broadcaster_id } = getRequestDataFromUri(req.url).params;
    store.modules.logger.info(JSON.stringify(req.headers.authorization));
    store.modules.logger.info(`Checking if ${broadcaster_id} is connected to EmoTracker...`);
    const response = await emoTrackerUtils.isEmoTrackerConnectedAsync(
      req.headers["Client-ID"] as string,
      req.headers["Authorization"] as string,
      broadcaster_id as string,
    );
    store.modules.logger.info(`EmoTracker Connected: ${response}`);
    res.send(response);
  }

  private static async searchItemHandler(req: Request, res: Response) {
    const { game, search } = req.body;
    res.send(await emoTrackerUtils.findItemSlug(game as string, search as string));
  }
}
