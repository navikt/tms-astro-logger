import pino, { DestinationStream, LoggerOptions } from 'pino'
import { context, isSpanContextValid, trace } from '@opentelemetry/api'

/**
 * Creates a pino logger configured for Nav's logging infrastructure
 * (logs.az.nav.no / Grafana Faro). Logs are emitted as JSON with:
 *
 * - `message` as the message key
 * - ISO-8601 timestamps
 * - the level as a string label (`info`, `warn`, `error`, ...)
 * - OpenTelemetry `trace_id`, `span_id` and `trace_flags` when an active span exists
 *
 * The log level defaults to `process.env.LOG_LEVEL`, falling back to `info`.
 *
 * This is used internally by the Astro logger entrypoint so that everything
 * logged through `Astro.logger` (and Astro's own logs) is formatted this way.
 * The optional `destination` lets callers redirect output (defaults to stdout).
 */
export const createLogger = (defaultConfig: LoggerOptions = {}, destination?: DestinationStream): pino.Logger =>
    pino(
        {
            ...defaultConfig,
            timestamp: pino.stdTimeFunctions.isoTime,
            messageKey: 'message',
            level: process.env.LOG_LEVEL || 'info',
            formatters: {
                level: (label) => ({ level: label }),
            },
            mixin: () => {
                const span = trace.getSpan(context.active())
                if (!span) return {}

                const spanContext = span.spanContext()
                if (!isSpanContextValid(spanContext)) return {}

                return {
                    trace_id: spanContext.traceId,
                    span_id: spanContext.spanId,
                    trace_flags: `0${spanContext.traceFlags.toString(16)}`,
                }
            },
        },
        destination,
    )
