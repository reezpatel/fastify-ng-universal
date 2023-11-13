import {
  CommonEngine,
  CommonEngineRenderOptions,
  CommonEngineOptions,
} from "@angular/ssr";
import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRegister, FastifyReply } from "fastify";
import fastifyStatic, { FastifyStaticOptions } from "@fastify/static";
import { REPLY, REPLY_RAW, REQUEST, REQUEST_RAW, RESPONSE } from "./tokens";
import { StaticProvider } from "@angular/core";
import { join } from "path";

export type FastifyNgUniversalEngineRenderOptions = Pick<
  CommonEngineRenderOptions,
  | "bootstrap"
  | "providers"
  | "publicPath"
  | "inlineCriticalCss"
  | "documentFilePath"
>;

export interface FastifyNgUniversalOptions {
  render: FastifyNgUniversalEngineRenderOptions;
  engine: CommonEngineOptions;
  static?: FastifyStaticOptions;
  exposeError?: boolean;
  root: string;
}

export type NgRenderFn = (
  reply: FastifyReply,
  override?: Partial<CommonEngineRenderOptions>
) => Promise<void>;

declare module "fastify" {
  interface FastifyRequest {
    ngRender: NgRenderFn;
  }
}

// const renderHTML = (req: FastifyRegister, reply: FastifyReply, override: Partial<Rend>)

const FastifyNgUniversal = fp(
  async (fastify: FastifyInstance, options: FastifyNgUniversalOptions) => {
    fastify.register(fastifyStatic, {
      root: options.root,
      wildcard: false,
      index: ["index.original.html", "index.html", "index.htm"],
      allowedPath: (pathName, root, request) => {
        if (pathName === "/" || pathName.endsWith(".html")) {
          return false;
        }

        return true;
      },
      ...(options.static ?? {}),
    });

    const engine = new CommonEngine(options.render);

    fastify.decorateRequest(
      "ngRender",
      async function fn(
        reply: FastifyReply,
        override: Partial<CommonEngineRenderOptions> = {}
      ) {
        try {
          if (!options.render.bootstrap && !override.bootstrap) {
            throw new Error("You must pass in a NgModule to be bootstrapped");
          }

          const commonProviders: StaticProvider[] = [
            {
              provide: REQUEST,
              useValue: this,
            },
            {
              provide: REPLY,
              useValue: reply,
            },
            {
              provide: RESPONSE,
              useValue: reply,
            },
            {
              provide: REPLY_RAW,
              useValue: reply.raw,
            },
            {
              provide: REQUEST_RAW,
              useValue: this.raw,
            },
          ];

          const renderedHTML = await engine.render({
            ...options.render,
            documentFilePath:
              options.render.documentFilePath ||
              join(options.root, "index.html"),
            inlineCriticalCss: options.render.inlineCriticalCss ?? true,
            url: `${this.protocol}://${this.hostname}${this.url}`,
            ...override,
            providers: [
              ...(options.render.providers ?? []),
              ...(override.providers ?? []),
              commonProviders,
            ],
          });

          reply
            .header("Content-Type", "text/html; charset=UTF-8")
            .send(renderedHTML);
        } catch (e) {
          console.error(e);

          if (options.exposeError) {
            reply.code(500).send({
              success: false,
              message: e instanceof Error ? e.message : "",
              error: e,
            });
          } else {
            reply.code(500).send({
              success: false,
              message: "Something went wrong",
            });
          }
        }
      }
    );
  },
  { fastify: "4.x", name: "fastify-ng-universal" }
);

export default FastifyNgUniversal;
