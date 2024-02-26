import { Logger } from "@crowbartools/firebot-custom-scripts-types/types/modules/logger";
import { RequestData, Parameters } from "@t/requests";
import { Response } from "express";

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


export const endpointErrorHandler = (logger: Logger, err: unknown, res: Response): false => {
  logger.error(err?.toString() ?? err as string);
  res.send(err);
  return false;
}
