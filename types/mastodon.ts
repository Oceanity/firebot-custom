export type Media = {
  file: FormData;
}

export type RemoteAttachment = {
  url: string;
  description: string;
}

export type MastodonContext = {
  apiBase: string;
  accessToken: string;
}
