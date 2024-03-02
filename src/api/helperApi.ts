import { Request, Response } from "express";
import store from "@u/store";

export default class HelperApi {
  private static readonly route: string = "/helper";

  static registerEndpoints = async (): Promise<void> => {
    const { modules, prefix } = store;
    const { httpServer } = modules;

    let result = true;

    result &&= httpServer.registerCustomRoute(prefix, `${this.route}/isLinkImage`, "POST", this.isLinkImageHandler);

    if (!result) throw "Could not register all endpoints for Helper Api"
  }

  private static isLinkImageHandler = async (req: Request, res: Response): Promise<void> => {
    const { url } = req.body;

    store.modules.logger.info(url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "*/*"
      }
    });

    if (!response) throw `Could not fetch URL: ${url}`;

    const type = response.headers.get("content-type");
    store.modules.logger.info(type ?? "unknown type");

    res.send({ isImage: type?.startsWith("image/") });
  }
}
