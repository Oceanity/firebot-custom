import { MastodonContext, RemoteAttachment } from "@t/mastodon";
import FileUtils from "./fileUtils";
import store from "@u/global";

export default class MastodonUtils {
  private readonly headers: HeadersInit;
  private readonly apiBase: string;

  constructor(context: MastodonContext) {
    if (!context.accessToken) throw "Could not read MASTODON_ACCESS_TOKEN";

    this.apiBase = context.apiBase;
    this.headers = {
      "Authorization": `Bearer ${context.accessToken}`
    }
  }

  postNewMessage = async(status: string, attachments?: RemoteAttachment[]): Promise<boolean> => {
    const { apiBase, headers } = this;

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
        store.modules.logger.info(JSON.stringify(data));
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
      store.modules.logger.error(data.error);
      return false;
    }

    return true;
  }
}
