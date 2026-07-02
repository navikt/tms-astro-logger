import type { AstroLoggerMessage } from 'astro'
import type { DestinationStream } from 'pino'
import { describe, expect, it } from 'vitest'

import { createAstroLogger } from '../package/astro-logger'

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

function message(overrides: Partial<AstroLoggerMessage>): AstroLoggerMessage {
    return {
        level: 'info',
        label: 'app',
        message: 'hello',
        newLine: true,
        ...overrides,
    } as AstroLoggerMessage
}

describe('createAstroLogger', () => {
    it('writes the message and label in Nav/Grafana JSON format', () => {
        const { stream, entries } = collector()
        createAstroLogger({}, stream).write(message({ label: 'router', message: 'started' }))

        const [entry] = entries()
        expect(entry.message).toBe('started')
        expect(entry.label).toBe('router')
        expect(entry.level).toBe('info')
    })

    it('omits the label binding when none is provided', () => {
        const { stream, entries } = collector()
        createAstroLogger({}, stream).write(message({ label: undefined, message: 'no label' }))

        const [entry] = entries()
        expect(entry).not.toHaveProperty('label')
        expect(entry.message).toBe('no label')
    })

    it.each([
        ['error', 'error'],
        ['warn', 'warn'],
        ['info', 'info'],
        ['debug', 'debug'],
    ] as const)('maps the "%s" Astro level to the "%s" pino level', (astroLevel, expectedLevel) => {
        const { stream, entries } = collector()
        createAstroLogger({ level: 'debug' }, stream).write(message({ level: astroLevel }))

        expect(entries()[0].level).toBe(expectedLevel)
    })

    it('filters out messages below the configured level', () => {
        const { stream, entries } = collector()
        const destination = createAstroLogger({ level: 'warn' }, stream)

        destination.write(message({ level: 'info', message: 'suppressed' }))
        destination.write(message({ level: 'warn', message: 'kept' }))

        const results = entries()
        expect(results).toHaveLength(1)
        expect(results[0].message).toBe('kept')
    })

    it('exposes flush and close that resolve', async () => {
        const { stream } = collector()
        const destination = createAstroLogger({}, stream)

        await expect(destination.flush?.()).resolves.toBeUndefined()
        await expect(destination.close?.()).resolves.toBeUndefined()
    })
})
