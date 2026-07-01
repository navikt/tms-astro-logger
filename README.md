# @navikt/astro-logger

A custom logger for Astro that emits Nav/Grafana-friendly structured JSON logs.

It plugs into Astro's [Logger API](https://docs.astro.build/en/reference/logger-reference/#custom-loggers)
so that **all** of Astro's logs — and your own, via
[`Astro.logger`](https://docs.astro.build/en/reference/api-reference/#logger) — are emitted in a JSON
format that logs.az.nav.no understands and Grafana Faro is happy with:

```json
{ "level": "info", "time": "2026-06-30T17:37:49.229Z", "label": "router", "message": "router started" }
```

Under the hood it wraps [pino](https://getpino.io/), giving you this output: `message` as the message key, ISO-8601 
timestamps, the level as a string label, and OpenTelemetry `trace_id` / `span_id` / `trace_flags` when an active span
exists.

## Installation

```bash
pnpm i @navikt/astro-logger pino
```

`astro` and `pino` are peer dependencies.

## Step 1: Register the Astro logger

Point Astro's `logger.entrypoint` at this package in `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config'

export default defineConfig({
    logger: { entrypoint: '@navikt/astro-logger' },
})
```

You can optionally pass serializable options. The log `level` defaults to
`process.env.LOG_LEVEL`, falling back to `info`:

```js
export default defineConfig({
    logger: { entrypoint: '@navikt/astro-logger', options: { level: 'warn' } },
})
```

> When you define a custom logger, you are in charge of all logs, even the ones emitted by Astro.

## Step 2: Log from your application code with `Astro.logger`

Use the built-in [`Astro.logger`](https://docs.astro.build/en/reference/api-reference/#logger) (also available as
`context.logger` in endpoints and middleware). Because it flows through the custom logger registered above, every
message is emitted in the Nav/Grafana JSON format automatically.

In `.astro` components:

```astro
---
Astro.logger.info('Hello from the server')
Astro.logger.warn('Something looks off')
Astro.logger.error("Can't find the checkout ID.")
---
```

In endpoints and middleware:

```ts
import type { APIContext } from 'astro'

export function GET({ logger }: APIContext) {
    logger.info('Handling request')
    return new Response('ok')
}
```

The log level is read from `process.env.LOG_LEVEL` (defaults to `info`).

## Step 3: pino-pretty for local development (optional)

Pipe your dev server output through `pino-pretty` with the correct message key:

```bash
npm i -D pino-pretty
```

```json
{
    "scripts": {
        "dev": "astro dev | pino-pretty --messageKey=message"
    }
}
```

## API

| Export | From | Description |
| --- | --- | --- |
| `default` (`createAstroLogger`) | `@navikt/astro-logger` | Astro logger entrypoint factory returning an `AstroLoggerDestination`. |
| `createAstroLogger(options?)` | `@navikt/astro-logger` | Same as the default export, named. |

### `AstroLoggerOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `level` | `'debug' \| 'info' \| 'warn' \| 'error' \| 'silent'` | `LOG_LEVEL` or `info` | Minimum level of logs to print. |
| `pino` | `pino.LoggerOptions` | `{}` | Advanced pino options forwarded to the underlying logger. |

## License

MIT
