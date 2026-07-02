import type { AstroLoggerDestination, AstroLoggerLevel, AstroLoggerMessage } from 'astro'
import { matchesLevel } from 'astro/logger'
import type { DestinationStream, LoggerOptions } from 'pino'

import { createLogger } from './logger'

export interface AstroLoggerOptions {
    /**
     * The minimum level of logs that should be printed. Defaults to
     * `process.env.LOG_LEVEL`, falling back to `info`.
     *
     * This must be serializable, as required by the Astro logger entrypoint API.
     */
    level?: AstroLoggerLevel
    /**
     * Extra pino options forwarded to the underlying logger, for advanced use.
     */
    pino?: LoggerOptions
}

const writeWithLevel = (logger: ReturnType<typeof createLogger>, message: AstroLoggerMessage): void => {
    const bindings = message.label != null ? { label: message.label } : {}

    switch (message.level) {
        case 'error':
            logger.error(bindings, message.message)
            break
        case 'warn':
            logger.warn(bindings, message.message)
            break
        case 'debug':
            logger.debug(bindings, message.message)
            break
        case 'info':
        default:
            logger.info(bindings, message.message)
            break
    }
}

/**
 * Creates an Astro custom logger that emits Nav/Grafana-friendly JSON.
 * Wire it up in `astro.config.mjs`:
 *
 * ```js
 * import { defineConfig } from 'astro/config'
 *
 * export default defineConfig({
 *     logger: { entrypoint: '@navikt/astro-logger' },
 * })
 * ```
 *
 * When configured, this logger takes over *all* of Astro's logging output,
 * including Astro's own internal logs, and formats them as structured JSON
 * with ISO timestamps, a string level label, and OpenTelemetry trace fields.
 *
 * The optional `destination` lets callers redirect output (defaults to stdout).
 */
export const createAstroLogger = (
    options: AstroLoggerOptions = {},
    destination?: DestinationStream,
): AstroLoggerDestination<AstroLoggerMessage> => {
    const level: AstroLoggerLevel = options.level ?? (process.env.LOG_LEVEL as AstroLoggerLevel | undefined) ?? 'info'

    const logger = createLogger(options.pino, destination)
    // Level filtering is delegated to Astro's `matchesLevel` below, so the
    // underlying pino instance must not filter anything out itself.
    logger.level = 'trace'

    return {
        write(message: AstroLoggerMessage): void {
            if (!matchesLevel(message.level, level)) return

            writeWithLevel(logger, message)
        },
        async flush(): Promise<void> {
            await new Promise<void>((resolve) => logger.flush(() => resolve()))
        },
        async close(): Promise<void> {
            await new Promise<void>((resolve) => logger.flush(() => resolve()))
        },
    }
}

export default createAstroLogger
