import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { MastodonContext } from "@t/mastodon";
import env from "@u/envUtils";

export default class Globals {
  static modules: ScriptModules;
  static readonly prefix: string = "oceanity";
  static readonly firebotApiBase: string = `http://localhost:7472/integrations/${Globals.prefix}`;
  static getBotsinSpaceContext = (): MastodonContext => ({
    apiBase: "https://botsin.space/api",
    accessToken: env.getEnvVarOrThrow("BOTSINSPACE_ACCESS_TOKEN")
  })
}
