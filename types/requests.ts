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
