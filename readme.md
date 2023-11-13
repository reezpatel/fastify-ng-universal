# fastify-ng-universal

A replacement for angular universal `express-engine` for improved performance.

## Install

```bash
yarn add fastify-ng-universal fastify @fastify/static
```

This library has several peer dependencies, some of them are installed as part angular + angular-universal.

## Usage

Plugin decorates `req` with `ngRender` function. Before below for more info.

```js
req.ngRender(reply, renderingOptions);
```

## Instructions

1. Navigate to angular project.

2. Run `ng add @nguniversal/express-engine` to add angular universal to existing project.

3. Replace `server.ts` with `example/hero-app/server.ts`.

```ts
import "zone.js/dist/zone-node";

import FastifyNgUniversal from "../../lib";
import Fastify from "fastify";
import { join } from "path";

import { AppServerModule } from "./src/main.server";

const createServer = () => {
  const app = Fastify({
    logger: true,
  });

  // Change these 2 lines to match you directory structure
  const distFolder = join(process.cwd(), "dist/hero-app/browser");
  const documentFilePath = join(
    process.cwd(),
    "dist/hero-app/browser",
    "index.html"
  );

  app.register(FastifyNgUniversal, {
    engine: {
      bootstrap: AppServerModule,
      inlineCriticalCss: true,
      documentFilePath,
    },
    root: distFolder,
    exposeError: true,
  });

  app.setNotFoundHandler((req, reply) => {
    req.ngRender(reply);
  });

  app.get("/*", (req, reply) => {
    req.ngRender(reply);
  });

  return app;
};

async function run() {
  const port = Number(process.env["PORT"] || "4000");

  // Start up the Node server
  const server = await createServer();
  server.listen({ port }, (err, address) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Fastify server listening on ${address}`);
    }
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || "";
if (moduleFilename === __filename || moduleFilename.includes("iisnode")) {
  run();
}

export * from "./src/main.server";
```

### Plugin Options

Plugin supports following options

#### engine options

`engine` - Options passed to `@nguniversal/common/engine`

```bash
bootstrap - NgModule for bootstrapping
providers - Array of providers
publicPath - Public path for application
inlineCriticalCss - (default: true) - Self explanatory
documentFilePath - path index.html for rendering primary page
```

#### static options

`static` - Options passed to `@fastify/static`, refer [here](https://github.com/fastify/fastify-static#options)

#### root directory

- `root` - Directory pointing to root of dist folder

### Rendering options

Rendering support all the engine options, you can use it to override plugin options for different routes.
