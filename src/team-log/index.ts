import { createTeamLogger } from './teamLogger'

/**
 * A ready-to-use secure (team) logger. In production it ships logs over
 * pino-socket to `team-logs.nais-system`; locally it logs to stdout/stderr.
 *
 * @see https://docs.nais.io/observability/logging/how-to/team-logs
 */
export const teamLogger = createTeamLogger()

export { createTeamLogger }
