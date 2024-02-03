import { HttpServerManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/http-server-manager";

export default async function router(httpServer: HttpServerManager) {
  httpServer.registerCustomRoute(
    "oceanibot",
    "/test",
    "GET",
    async (req: Request, res: Response) => {
      console.log(res.json);
    }
  );
}
