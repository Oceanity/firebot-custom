import { Request, Response } from "express";
import { HttpMethod } from "@t/requests";
import db from "@u/staticDbUtils";
import store from "@u/store";

/**
 * Api for getting data for mastodon bird facts
 */
export default class MastodonBirdFactApi {
  /**
   * The db file where mastodon data is stored
   */
  private static readonly path: string = "./db/mastodon";

  /**
   * The route for this api
   */
  private static readonly route: string = "/mastodon/birdFacts";

  /**
   * The route in the db file where the next id for bird facts is stored
   */
  private static readonly nextIdRoute: string = "/nextBirdFactId";

  /**
   * Initializes the api
   */
  static registerEndpoints = async (): Promise<void> => {
    const { modules, prefix } = store;
    const { httpServer } = modules;

    const endpoints: readonly [string, HttpMethod, (req: Request, res: Response) => Promise<void>][] = [
      [`${this.route}/nextId`, "GET", this.getNextIdHandler],
      [`${this.route}/nextId`, "POST", this.incrementNextIdHandler],
    ];

    for (const [route, method, handler] of endpoints) {
      if (!httpServer.registerCustomRoute(prefix, route, method, handler)) {
        throw "Could not register all endpoints for Mastodon Birb Fact Api";
      }
    }
  }

  /**
   * Handler for getting the next id
   */
  private static getNextIdHandler = async (req: Request, res: Response): Promise<void> => {
    const id = await db.get<number>(this.path, this.nextIdRoute) ?? 1;
    res.send({ id });
  }

  /**
   * Handler for incrementing the next id
   */
  private static incrementNextIdHandler = async (req: Request, res: Response): Promise<void> => {
    const id = await db.get<number>(this.path, this.nextIdRoute, 1) ?? 0;
    res.send(await db.push<number>(this.path, this.nextIdRoute, id + 1));
  }
}
