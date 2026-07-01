# @navikt/astro-logger

En egendefinert logger for Astro som sender ut strukturerte JSON-logger tilpasset Nav/Grafana.

Den kobler seg på Astros [Logger-API](https://docs.astro.build/en/reference/logger-reference/#custom-loggers)
slik at **alle** Astros logger — og dine egne, via
[`Astro.logger`](https://docs.astro.build/en/reference/api-reference/#logger) — sendes ut i et JSON-format
som logs.az.nav.no forstår og som Grafana Faro er fornøyd med:

```json
{ "level": "info", "time": "2026-06-30T17:37:49.229Z", "label": "router", "message": "router started" }
```

Under panseret bruker den [pino](https://getpino.io/), som gir deg denne utskriften: `message` som meldingsnøkkel,
ISO-8601-tidsstempler, nivået som en tekstetikett, og OpenTelemetry `trace_id` / `span_id` / `trace_flags` når det
finnes et aktivt span.

## Installasjon

```bash
pnpm i @navikt/astro-logger pino
```

`astro` og `pino` er peer-avhengigheter.

## Steg 1: Registrer Astro-loggeren

Pek Astros `logger.entrypoint` til denne pakken i `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config'

export default defineConfig({
    logger: { entrypoint: '@navikt/astro-logger' },
})
```

Du kan valgfritt sende med serialiserbare opsjoner. Loggnivået `level` er som standard
`process.env.LOG_LEVEL`, og faller tilbake til `info`:

```js
export default defineConfig({
    logger: { entrypoint: '@navikt/astro-logger', options: { level: 'warn' } },
})
```

> Når du definerer en egendefinert logger, har du ansvaret for alle logger, også de som Astro selv sender ut.

## Steg 2: Logg fra applikasjonskoden din med `Astro.logger`

Bruk den innebygde [`Astro.logger`](https://docs.astro.build/en/reference/api-reference/#logger) (også tilgjengelig som
`context.logger` i endepunkter og mellomvare). Fordi den går gjennom den egendefinerte loggeren du registrerte over,
sendes hver melding automatisk ut i JSON-formatet for Nav/Grafana.

I `.astro`-komponenter:

```astro
---
Astro.logger.info('Hei fra serveren')
Astro.logger.warn('Noe ser feil ut')
Astro.logger.error('Finner ikke checkout-IDen.')
---
```

I endepunkter og mellomvare:

```ts
import type { APIContext } from 'astro'

export function GET({ logger }: APIContext) {
    logger.info('Håndterer forespørsel')
    return new Response('ok')
}
```

Loggnivået leses fra `process.env.LOG_LEVEL` (er som standard `info`).

## Steg 3: pino-pretty for lokal utvikling (valgfritt)

Send utskriften fra dev-serveren gjennom `pino-pretty` med riktig meldingsnøkkel:

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

| Eksport | Fra | Beskrivelse |
| --- | --- | --- |
| `default` (`createAstroLogger`) | `@navikt/astro-logger` | Fabrikk for Astro-logger-entrypoint som returnerer en `AstroLoggerDestination`. |
| `createAstroLogger(options?)` | `@navikt/astro-logger` | Det samme som standardeksporten, navngitt. |

### `AstroLoggerOptions`

| Opsjon | Type | Standard | Beskrivelse |
| --- | --- | --- | --- |
| `level` | `'debug' \| 'info' \| 'warn' \| 'error' \| 'silent'` | `LOG_LEVEL` eller `info` | Laveste loggnivå som skal skrives ut. |
| `pino` | `pino.LoggerOptions` | `{}` | Avanserte pino-opsjoner som videresendes til den underliggende loggeren. |

## Lisens

MIT
