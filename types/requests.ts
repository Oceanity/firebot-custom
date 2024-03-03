export type RequestData = {
  root: string;
  params: Parameters;
};

export type ResponseData = {
  status: number;
  message?: string;
};

export type Parameters = {
  [key: string]: string;
};

export type TriforceOpenAiRequest = {
  message: string;
}

export type HttpMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "HEAD"
    | "CONNECT"
    | "OPTIONS"
    | "TRACE";
