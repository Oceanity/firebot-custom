import { Request, Response } from "express";
import api from "@u/apiUtils";
import helper from "@u/helperUtils";

export default class HelperApi {
  private static readonly route: string = "/helper";

  static registerEndpoints() {
    api.registerAllEndpoints([[`${this.route}/isLinkImage`, "POST", this.isLinkImageHandler]], "Helper");
  }

  private static async isLinkImageHandler(req: Request, res: Response) {
    const { url } = req.body;
    res.send(await helper.isLinkImage(url));
  }
}
