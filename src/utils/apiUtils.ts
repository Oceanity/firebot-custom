import { Request, Response } from "express";
import { HttpMethod } from "@t/requests";
import store from "@u/store";

type HttpServerRequest = (req: Request, res: Response) => Promise<void>;

type ApiEndpoint = [
  path: string,
  method: HttpMethod,
  handler: HttpServerRequest,
]

/**
 * Utility class for registering all API endpoints.
 */
export default class ApiUtils {
  /**
   * Registers all API endpoints.
   * @param endpoints Array of API endpoints to register. Each endpoint is an array of [path, method, handler]
   * @param apiName   Optional name of the API being registered. Used for error messages.
   * @throws          If any endpoints fail to register.
   */
  static registerAllEndpoints(endpoints: ApiEndpoint[], apiName?: string): void {
    for (const [path, method, handler] of endpoints) {
      if (!store.modules.httpServer.registerCustomRoute(store.prefix, path, method, handler)) {
        throw `Could not register all endpoints for ${ apiName ? `${apiName} ` : ""}API`;
      }
    }
  }
}


