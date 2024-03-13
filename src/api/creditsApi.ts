import { Request, Response } from "express";
import api from "@u/apiUtils";
import credits from "@u/creditsUtils";
import store from "@u/store";

export default class CreditsApi {
  private static readonly route = "/credits";

  static registerEndpoints() {
    api.registerAllEndpoints(
      [
        [this.route, "GET", this.getCreditsPageHandler],
        [`${this.route}/lastChecked`, "GET", this.lastCheckedHandler],
        // [`${this.route}/reset`, "POST", this.resetCreditsHandler],
        [`${this.route}/addFollower`, "POST", this.addFollowerHandler],
        [`${this.route}/addModerator`, "POST", this.addModeratorHandler],
        [`${this.route}/resetCurrentSubscribers`, "POST", this.resetCurrentSubsHandler],
        [`${this.route}/addCurrentSubscriber`, "POST", this.addCurrentSubscriberHandler],
        [`${this.route}/addNewSubscriber`, "POST", this.addNewSubscriberHandler],
        // [`${this.route}/addGiftSub`, "POST", this.addGiftSubCreditHandler],
      ],
      "Credits",
    );
  }
  static async lastCheckedHandler(req: Request, res: Response) {
    res.send({ days: await credits.getDaysSinceSubsLastCheckedAsync() });
  }

  static async getCreditsPageHandler(req: Request, res: Response) {
    res.send(await credits.buildCreditsPageAsync());
  }

  static async resetCreditsHandler(req: Request, res: Response) {
    res.send(await credits.resetCreditsAsync());
  }

  static async addFollowerHandler(req: Request, res: Response) {
    const { id, displayName, profileImageUrl } = req.body;
    res.send(await credits.addFollowerAsync({ id, displayName, profileImageUrl }));
  }

  static async addModeratorHandler(req: Request, res: Response) {
    const { id, displayName, profileImageUrl } = req.body;
    res.send(await credits.addModeratorAsync({ id, displayName, profileImageUrl }));
  }

  static async resetCurrentSubsHandler(req: Request, res: Response) {
    res.send(await credits.resetCurrentSubscribersAsync());
  }

  static async addCurrentSubscriberHandler(req: Request, res: Response) {
    const { id, displayName, profileImageUrl, tier } = req.body;
    store.modules.logger.info(JSON.stringify(req.body));
    res.send(await credits.addCurrentSubscriberAsync({ id, displayName, profileImageUrl, tier }));
  }

  static async addNewSubscriberHandler(req: Request, res: Response) {
    const { id, displayName, profileImageUrl, tier } = req.body;
    res.send(await credits.addNewSubscriberAsync({ id, displayName, profileImageUrl, tier }));
  }

  //   static async addGiftSubCreditHandler(req: Request, res: Response) {
  //     // TODO
  //   }
}
