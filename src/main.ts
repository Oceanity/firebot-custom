import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import useRouter from "@/router";
import PlexAuth from "@/plex-overlay/api/auth";

interface Params {
  message: string;
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => ({
    name: "Oshi's Custom Firebot Startup",
    description: "Extends Firebot functionality <a href='#test'>Test</a>",
    author: "Oceanity",
    version: "1.0",
    firebotVersion: "5",
  }),
  getDefaultParameters: () => ({
    message: {
      type: "string",
      default: "Hello World!",
      description: "Message",
      secondaryDescription: "Enter a message here",
    },
    test: {
      type: "button",
    },
  }),
  run: async (runRequest) => {
    const { logger, httpServer } = runRequest.modules;
    logger.info(runRequest.parameters.message);
    useRouter(logger, httpServer);

    const plexAuth = new PlexAuth(logger);
    await plexAuth.login();
  },
};

export default script;
