import { Request, Response } from "express";
import store from "@u/store";
import BirdFactLoadingMessageUtils from "@u/birdFactLoadingMessageUtils";
import { CreateLoadingMessageRequest, DeleteLoadingMessageRequest, UpdateLoadingMessageRequest } from "@t/birdFacts";

export default class BirdFactLoadingMessageApi {
  private readonly loadingMessages: BirdFactLoadingMessageUtils;
  private readonly route: string = "/birdFacts/loadingMessages";

  constructor() {
    this.loadingMessages = new BirdFactLoadingMessageUtils();
  }

  setup = async (): Promise<void> => {
    await this.loadingMessages.setup();
    await this.registerEndpoints();
  }

  private registerEndpoints = async (): Promise<boolean> => {
    const { modules, prefix } = store;
    const { httpServer } = modules;

    let response = true;

    response &&= httpServer.registerCustomRoute(prefix, this.route, "GET", this.getHandler);
    response &&= httpServer.registerCustomRoute(prefix, `${this.route}/all`, "GET", this.getAllHandler);
    response &&= httpServer.registerCustomRoute(prefix, this.route, "PUT", this.putHandler);
    response &&= httpServer.registerCustomRoute(prefix, this.route, "PATCH", this.updateHandler);
    response &&= httpServer.registerCustomRoute(prefix, `${this.route}/delete`, "POST", this.deleteHandler);

    return response;
  }

  private getHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.loadingMessages.get());
  }

  private getAllHandler = async (req: Request, res: Response): Promise<void> => {
    res.send(await this.loadingMessages.getAll());
  }

  private putHandler = async (req: Request, res: Response): Promise<void> => {
    const { message } = req.body as CreateLoadingMessageRequest;
    res.send(await this.loadingMessages.push(message));
  }

  private updateHandler = async (req: Request, res: Response): Promise<void> => {
    const { search, replace } = req.body as UpdateLoadingMessageRequest;
    res.send(await this.loadingMessages.update(search, replace));
  }

  private deleteHandler = async (req: Request, res: Response): Promise<void> => {
    const { search } = req.body as DeleteLoadingMessageRequest;
    res.send(await this.loadingMessages.delete(search));
  }
}
