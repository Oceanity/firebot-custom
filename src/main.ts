import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import useRouter from "@test/router";

interface Params {
  message: string;
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Oshi's Custom Firebot Startup",
      description: "Extends Firebot functionality",
      author: "Oceanity",
      version: "1.0",
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      message: {
        type: "string",
        default: "Hello World!",
        description: "Message",
        secondaryDescription: "Enter a message here",
      },
    };
  },
  run: (runRequest) => {
    const { logger, httpServer } = runRequest.modules;
    logger.info(runRequest.parameters.message);
    useRouter(httpServer);
  },
};

export default script;
