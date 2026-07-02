import type { DestinationStream } from 'pino'
import { describe, expect, it } from 'vitest'

import { createLogger } from '../package/logger'

/**
 * A pino destination that collects every written line, parsed from JSON.
 */
function collector(): { stream: DestinationStream; entries: () => Array<Record<string, unknown>> } {
    const lines: string[] = []
    return {
        stream: {
            write(chunk: string): void {
                lines.push(chunk)
            },
        },
        entries: () =>
            lines
                .join('')
                .split('\n')
                .filter((line) => line.trim().length > 0)
                .map((line) => JSON.parse(line) as Record<string, unknown>),
    }
}

describe('createLogger', () => {
    it('uses "message" as the message key', () => {
        const { stream, entries } = collector()
        createLogger({}, stream).info('hello world')

        const [entry] = entries()
        expect(entry.message).toBe('hello world')
        expect(entry).not.toHaveProperty('msg')
    })

    it('emits the level as a string label', () => {
        const { stream, entries } = collector()
        createLogger({}, stream).warn('careful')

        expect(entries()[0].level).toBe('warn')
    })

    it('emits ISO-8601 timestamps under "time"', () => {
        const { stream, entries } = collector()
        createLogger({}, stream).info('tick')

        const [entry] = entries()
        expect(typeof entry.time).toBe('string')
        expect(new Date(entry.time as string).toISOString()).toBe(entry.time)
    })

    it('includes bindings passed as the first argument', () => {
        const { stream, entries } = collector()
        createLogger({}, stream).info({ label: 'router' }, 'started')

        const [entry] = entries()
        expect(entry.label).toBe('router')
        expect(entry.message).toBe('started')
    })
})
