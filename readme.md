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
