import { MastodonContext, RemoteAttachment } from "@t/mastodon";
import file from "./fileUtils";
import env from "@u/envUtils";
import store from "@u/store";

/**
 * Utility class for interacting with the Mastodon API
 */
export default class MastodonUtils {
  /**
   * Posts a new status to Mastodon
   * @param context The Mastodon API context
   * @param status The status message to post
   * @param attachments Optional attachments to include with the post
   * @returns true if successful, otherwise false
   */
  static postNewMessage = async (
    context: MastodonContext,
    status: string,
    attachments?: RemoteAttachment[],
  ): Promise<boolean> => {
    const headers = MastodonUtils.getHeaders(context);
    const attachmentIds = await this.uploadAttachments(context, attachments);

    const body = JSON.stringify({
      status: status,
      sensitive: false,
      media_ids: attachmentIds,
      visibility: "unlisted",
    });

    const response = await fetch(`${context.apiBase}/v1/statuses`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body,
    });
    const data = await response.json();

    if (data.error) {
      store.modules.logger.error(data.error);
      return false;
    }

    return true;
  };

  private static async uploadAttachments(
    context: MastodonContext,
    attachments?: RemoteAttachment[],
  ): Promise<string[]> {
    if (!attachments || !attachments.length) return [];

    const attachmentIds: string[] = [];

    for (const attach of attachments) {
      const formData = new FormData();

      formData.append("file", await file.createBlobFromUrlAsync(attach.url));
      formData.append("description", attach.description);

      const uploadResp = await fetch(`${context.apiBase}/v2/media`, {
        method: "POST",
        headers: this.getHeaders(context),
        body: formData,
      });

      if (!uploadResp) continue;

      const data = await uploadResp.json();
      attachmentIds.push(data.id);
    }

    return attachmentIds;
  }

  private static getHeaders = (context: MastodonContext): HeadersInit => ({
    Authorization: `Bearer ${MastodonUtils.getAccessTokenOrThrow(context)}`,
  });

  private static getAccessTokenOrThrow = (context: MastodonContext): string => {
    if (context.accessToken) return context.accessToken;
    if (context.accessTokenEnvVar) return env.getEnvVarOrThrow(context.accessTokenEnvVar);
    throw `Could not get access token from process.env for ${context.apiBase}`;
  };
}
