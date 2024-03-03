import { RequestData, Parameters } from "@t/requests";

export const getRequestDataFromUri = (url: string): RequestData => {
  const [root, query] = url.split("?");
  if (!query) return { root, params: {} };

  const vars = query.split("&");
  const params: Parameters = {};

  vars.forEach((v) => {
    const [key, value] = v.split("=");
    params[key] = value;
  });

  return {
    root,
    params,
  };
};
