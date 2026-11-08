import { atom, read, update } from 'claude-code'
import type { Register, SessionRateLimit } from 'claude-code'

const rateLimits = atom({ plugin: 'ben', key: 'rateLimits' } as const, [])

const LABELS: Record<string, string> = { five_hour: '5h', seven_day: '7j' }
const WEEKDAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']

const formatReset = (kind: string, resetsAt: string, now: number) => {
  const at = Date.parse(resetsAt)
  if (kind === 'seven_day') return WEEKDAYS[new Date(at).getDay()]
  const minutes = Math.max(0, Math.round((at - now) / 60000))
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`
}

const WARNING_FROM = 70
const ERROR_ABOVE = 90

const formatLimit = (limit: SessionRateLimit, percent: number, now: number) => {
  const label = `${LABELS[limit.kind]} ${percent}%`
  if (percent < WARNING_FROM || !limit.resetsAt) return label
  return `${label} ↻${formatReset(limit.kind, limit.resetsAt, now)}`
}

const colorOf = (percent: number) =>
  percent > ERROR_ABOVE ? 'error' : percent >= WARNING_FROM ? 'warning' : undefined

export const register: Register = on => {
  on('session.measure', async ($, e, next) => {
    await update($, rateLimits, () => e.rateLimits)
    return next(e)
  })

  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    if (e.surface !== 'terminal') return next(e)
    const limits = (await read($, rateLimits)).filter(l => l.kind in LABELS)
    if (limits.length === 0) return next(e)

    const now = await $.clock.now()
    const { Box, Text } = $.ui.resolve(e)
    const modes = e.props.modes.length > 0 ? await next(e) : null

    return (
      <Box gap={1}>
        {modes}
        {limits.map((limit, i) => {
          const percent = Math.round(limit.percentUsed)
          const color = colorOf(percent)
          return (
            <Box key={limit.kind} gap={1}>
              {(i > 0 || modes) && <Text dimColor>·</Text>}
              <Text color={color} dimColor={!color}>
                {formatLimit(limit, percent, now)}
              </Text>
            </Box>
          )
        })}
      </Box>
    )
  })
}
