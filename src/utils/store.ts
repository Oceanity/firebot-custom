import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";

export default class Globals {
  static modules: ScriptModules;
  static readonly prefix: string = "oceanity";
  static readonly firebotApiBase: string = `http://localhost:7472/integrations/${this.prefix}`;
  static state: string = "a980jsdfa09sd8fjasd9807fj";
  static twitchToken: string = "";
}
