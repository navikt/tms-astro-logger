import { createAstroLogger } from './astro-logger'

export { createAstroLogger, type AstroLoggerOptions } from './astro-logger'

/**
 * Default export consumed by Astro's `logger.entrypoint` configuration.
 *
 * Once registered, all of Astro's logs — and anything you log via
 * `Astro.logger` / `context.logger` — are emitted in the Nav/Grafana JSON
 * format.
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
