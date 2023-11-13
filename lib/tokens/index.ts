import { InjectionToken } from "@angular/core";
import {
  FastifyReply,
  FastifyRequest,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
} from "fastify";
import { Server } from "http";

export const REQUEST: InjectionToken<FastifyRequest> =
  new InjectionToken<FastifyRequest>("REQUEST");
export const REPLY: InjectionToken<FastifyReply> =
  new InjectionToken<FastifyReply>("REPLY");

export type RawReply = RawReplyDefaultExpression<Server>;
export type RawRequest = RawRequestDefaultExpression<Server>;

export const REQUEST_RAW: InjectionToken<RawRequest> =
  new InjectionToken<RawRequest>("REQUEST_RAW");
export const REPLY_RAW: InjectionToken<RawReply> = new InjectionToken<RawReply>(
  "REPLY_RAW"
);

// For compatibility with old code
export const RESPONSE = REPLY;
