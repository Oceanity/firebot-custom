import BirdFactTopicUtils from "@u/birdFactTopicUtils";
import { Request, Response } from "express";
import store from "@u/store";
import { CreateTopicRequest, UpdateTopicRequest } from "@t/birdFacts";
import { HttpMethod } from "@t/requests";

/** Handles Bird Fact Topic API endpoints. */
export default class BirdFactTopicApi {
  /** Route that endpoints are registered to. */
  private readonly route: string = "/birdFacts/topics";

  /** Utilities for interacting with the database. */
  private readonly topics: BirdFactTopicUtils;

  /** Creates a new instance. */
  constructor() {
    this.topics = new BirdFactTopicUtils();
  }

  /** Sets up the class. */
  setup = async (): Promise<void> => {
    await this.topics.setup();
    await this.registerEndpoints();
  }

  /**
   * Registers the Bird Fact Topic API endpoints.
   * @returns A promise that resolves when the endpoints have been registered.
   */
  private registerEndpoints = async () => {
    const { modules, prefix } = store;

    const endpoints: [string, HttpMethod, (req: Request, res: Response) => Promise<void>][] = [
      [this.route,           "GET",    this.getRandomTopicHandler],
      [`${this.route}/all`,  "GET",    this.getAllTopicsHandler],
      [this.route,           "PUT",    this.putHandler],
      [this.route,           "PATCH",  this.patchHandler],
    ];

    for (const [route, method, handler] of endpoints) {
      if (!modules.httpServer.registerCustomRoute(prefix, route, method, handler)) {
        throw "Could not register all endpoints for Birb Fact Topics API";
      }
    }
  }

  /**
   * Handles a GET request to retrieve a random topic.
   * @param req The request.
   * @param res The response.
   */
  private getRandomTopicHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.topics.get());
  }

  /**
   * Handles a GET request to retrieve all topics.
   * @param req The request.
   * @param res The response.
   */
  private getAllTopicsHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.topics.getAll());
  }

  /**
   * Handles a PUT request to add a new topic.
   * @param req The request.
   * @param res The response.
   */
  private putHandler = async (req: Request, res: Response): Promise<void> => {
    const { topic } = req.body as CreateTopicRequest;
    res.send(await this.topics.push(topic));
  }

  /**
   * Handles a PATCH request to update a topic.
   * @param req The request.
   * @param res The response.
   */
  private patchHandler = async (req: Request, res: Response): Promise<void> => {
    const { search, replace } = req.body as UpdateTopicRequest;
    res.send(await this.topics.update(search, replace));
  }

  // private putTopicHandler = async (req: Request, res: Response): Promise<boolean> => {
  //   try {
  //     const { topic } = req.body as CreateTopicRequest;
  //     res.send(await this.birdFactUtils.pushTopic(topic));
  //     return true;
  //   } catch (err) {
  //     return endpointErrorHandler(store.modules.logger, err, res);
  //   }
  // }

  // private deleteTopicHandler = async (req: Request, res: Response): Promise<boolean> => {
  //   try {
  //     const { topic } = req.body as DeleteTopicRequest;
  //     res.send(await this.birdFactUtils.deleteTopic(topic));
  //     return true;
  //   } catch (err) {
  //     return endpointErrorHandler(store.modules.logger, err, res);
  //   }
  // }
}
