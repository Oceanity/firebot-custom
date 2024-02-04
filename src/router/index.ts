import { Request, Response } from "express";
import { HttpServerManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/http-server-manager";
import { Logger } from "@crowbartools/firebot-custom-scripts-types/types/modules/logger";

export default async function router(logger: Logger, httpServer: HttpServerManager) {
  logger.info("Registering our custom routes...");

  // Dummy endpoint
  httpServer.unregisterCustomRoute("oceanity", "/test", "GET");
  httpServer.registerCustomRoute(
    "oceanity",
    "/test",
    "GET",
    async (req: Request, res: Response) => {
      logger.info(res.json.toString());
      res.sendStatus(200);
    },
  );

  // Plex Auth Callback
  httpServer.unregisterCustomRoute("oceanity-plex-toolkit", "/plex-auth", "GET");
  httpServer.registerCustomRoute(
    "oceanity-plex-toolkit",
    "/plex-auth",
    "GET",
    async (req: Request, res: Response) => {
      logger.debug(JSON.stringify(req.body));
      logger.info(Object.keys(req).join(", "));
      res.send({
        status: 200,
        req,
        foo: "bar",
      });
    },
  );
}
