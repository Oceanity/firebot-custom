import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { MastodonContext, RemoteAttachment } from "@t/mastodon";
import * as dotenv from "dotenv";
import { resolve } from "path"
import FileUtils from "./fileUtils";
dotenv.config({ path: resolve(__dirname, "./.env") });

export default class MastodonUtils {
  private readonly modules: ScriptModules;
  private readonly headers: HeadersInit;
  private readonly apiBase: string;

  constructor(modules: ScriptModules, context: MastodonContext) {
    if (!context.accessToken) throw "Could not read MASTODON_ACCESS_TOKEN";

    this.modules = modules;
    this.apiBase = context.apiBase;
    this.headers = {
      "Authorization": `Bearer ${context.accessToken}`
    }
  }

  public postNewMessage = async(status: string, attachments?: RemoteAttachment[]): Promise<boolean> => {
    const { apiBase, headers, modules } = this;

    const attachmentIds: string[] = [];

    if (attachments && attachments.length) {
      for(const attach of attachments) {
        const formData = new FormData();

        formData.append("file", await FileUtils.createBlobFromUrl(attach.url));
        formData.append("description", attach.description);

        const uploadResp = await fetch(`${apiBase}/v2/media`, {
          method: "POST",
          headers,
          body: formData
        });

        if (!uploadResp) continue;

        const data = await uploadResp.json();
        modules.logger.info(JSON.stringify(data));
        attachmentIds.push(data.id);
      }
    }

    const body = JSON.stringify({
        status: status,
        sensitive: false,
        media_ids: attachmentIds,
        visibility: "unlisted"
      });

    const response = await fetch(`${apiBase}/v1/statuses`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body
    });
    const data = await response.json();

    if (data.error) {
      this.modules.logger.error(data.error);
      return false;
    }

    return true;
  }
}
