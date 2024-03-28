import { Request, Response } from "express";
import twitch from "@u/twitchUtils";
import api from "@u/apiUtils";

export default class TwitchApi {
  private static readonly route: string = "/twitch";

  static registerEndpoints() {
    api.registerAllEndpoints(
      [
        [`${this.route}/discordClips`, "POST", this.discordClipsHandler],
        [`${this.route}/clips/lastChecked`, "GET", this.getLastCheckedClipsDateHandler],
        [`${this.route}/clips/lastChecked`, "POST", this.setLastCheckedClipsDateHandler],
        [`${this.route}/raid/nonSubMessage`, "POST", this.nonSubMessageHandler],
      ],
      "Twitch",
    );
  }

  private static async getLastCheckedClipsDateHandler(req: Request, res: Response): Promise<void> {
    res.send(await twitch.getLastCheckedClipsDateAsync());
  }

  private static async setLastCheckedClipsDateHandler(req: Request, res: Response): Promise<void> {
    res.send(await twitch.setLastCheckedClipsDateAsync());
  }

  private static async discordClipsHandler(req: Request, res: Response): Promise<void> {
    res.send(twitch.postUnsharedClips());
  }

  private static async nonSubMessageHandler(req: Request, res: Response): Promise<void> {
    const { message } = req.body;
    res.send(await twitch.getNonSubMessage(message));
  }
}
