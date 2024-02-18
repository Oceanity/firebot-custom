import { ResponseData } from "@t/requests";

export const Respond409Conflict = (message?: string): ResponseData => ({
  status: 409,
  message
});

export const Respond503ServiceUnavailable = (message?: string): ResponseData => ({
  status: 503,
  message
})
