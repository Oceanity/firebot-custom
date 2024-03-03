import { Request, Response } from "express";
import twitch from "@u/twitchUtils";
import api from "@u/apiUtils";

export default class TwitchApi {
  private static readonly route: string = "/twitch";

  static registerEndpoints() {
    api.registerAllEndpoints([[`${this.route}/discordClips`, "POST", this.discordClipsHandler]], "Twitch");
  }

  private static async discordClipsHandler(req: Request, res: Response): Promise<void> {
    res.send(twitch.postUnsharedClips());
  }
}
