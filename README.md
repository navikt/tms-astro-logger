# @navikt/astro-logger

A custom logger for Astro that emits Nav/Grafana-friendly structured JSON logs.

It plugs into Astro's [Logger API](https://docs.astro.build/en/reference/logger-reference/#custom-loggers)
so that **all** of Astro's logs — and your own — are emitted in a JSON format that
logs.az.nav.no understands and Grafana Faro is happy with:

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

`astro` (>= 7) and `pino` (8/9/10) are peer dependencies. If you want
[team logs](https://docs.nais.io/observability/logging/how-to/team-logs), also install `pino-socket`:

```bash
npm i pino-socket
```

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

## Step 2: Log from your application code

For SSR endpoints, middleware and server utilities, import the ready-to-use pino `logger`:

```ts
import { logger } from '@navikt/astro-logger'

logger.info('Hello from the server')
logger.warn({ userId }, 'Something looks off')
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

## Team logs (secure logs)

For secure [team logs](https://docs.nais.io/observability/logging/how-to/team-logs), use the
`./team-log` subpath. In production it ships logs over `pino-socket` to `team-logs.nais-system`;
locally it logs to stdout/stderr.

```ts
import { teamLogger } from '@navikt/astro-logger/team-log'

teamLogger.info('Sensitive information that should go to team logs')
```

This requires the NAIS environment variables (`GOOGLE_CLOUD_PROJECT`, `NAIS_NAMESPACE`,
`NAIS_POD_NAME`/`HOSTNAME`, `NAIS_APP_NAME`) to be present in production.

## API

| Export | From | Description |
| --- | --- | --- |
| `default` (`createAstroLogger`) | `@navikt/astro-logger` | Astro logger entrypoint factory returning an `AstroLoggerDestination`. |
| `createAstroLogger(options?)` | `@navikt/astro-logger` | Same as the default export, named. |
| `logger` | `@navikt/astro-logger` | Ready-to-use pino instance for application code. |
| `createLogger(config?, destination?)` | `@navikt/astro-logger` | Factory for additional pino instances. |
| `teamLogger` | `@navikt/astro-logger/team-log` | Ready-to-use secure (team) logger. |
| `createTeamLogger(config?)` | `@navikt/astro-logger/team-log` | Factory for additional team loggers. |

### `AstroLoggerOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `level` | `'debug' \| 'info' \| 'warn' \| 'error' \| 'silent'` | `LOG_LEVEL` or `info` | Minimum level of logs to print. |
| `pino` | `pino.LoggerOptions` | `{}` | Advanced pino options forwarded to the underlying logger. |

## License

MIT
