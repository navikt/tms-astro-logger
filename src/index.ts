import { createAstroLogger } from './astro-logger'
import { createLogger } from './logger'

/**
 * A ready-to-use pino logger for application code (SSR endpoints, middleware,
 * server utilities). Logs in the Nav/Grafana JSON format.
 *
 * ```ts
 * import { logger } from '@navikt/astro-logger'
 *
 * logger.info('Hello from the server')
 * ```
 */
export const logger = createLogger()

export { createLogger } from './logger'
export { createAstroLogger, type AstroLoggerOptions } from './astro-logger'

/**
 * Default export consumed by Astro's `logger.entrypoint` configuration.
 *
 * ```js
 * // astro.config.mjs
 * import { defineConfig } from 'astro/config'
 *
 * export default defineConfig({
 *     logger: { entrypoint: '@navikt/astro-logger' },
 * })
 * ```
 */
export default createAstroLogger
