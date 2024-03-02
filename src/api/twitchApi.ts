import { Request, Response } from "express";
import store from "@u/store";
import TwitchUtils from "@/utils/twitchUtils";
import { HttpMethod } from "@t/requests";

/**
 * Handles Twitch-related API endpoints.
 */
export default class TwitchApi {
  /**
   * The utility class for Twitch-related functionality.
   */
  private readonly twitch: TwitchUtils;
  /**
   * The base route for Twitch-related endpoints.
   */
  private readonly route: string = "/twitch";

  /**
   * Constructor for creating a new instance of the class.
   */
  constructor() {
    this.twitch = new TwitchUtils();
  }

  /**
   * Sets up the Twitch API.
   */
  setup = async (): Promise<void> => {
    await this.twitch.setup();
  }

  /**
   * Registers all Twitch-related endpoints.
   */
  registerEndpoints = async (): Promise<void> => {
    const { modules, prefix } = store;
    const { httpServer } = modules;

    const endpoints: [string, HttpMethod, (req: Request, res: Response) => Promise<void>][] = [
      [`${this.route}/discordClips`, "POST", this.discordClipsHandler],
    ];

    for (const [route, method, handler] of endpoints) {
      if (!httpServer.registerCustomRoute(prefix, route, method, handler)) {
        throw "Could not register all endpoints for Twitch Api";
      }
    }
  }

  /**
   * Handles the POST request for /twitch/discordClips.
   * @param req The request.
   * @param res The response.
   */
  private discordClipsHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(req.body);
  }
}
