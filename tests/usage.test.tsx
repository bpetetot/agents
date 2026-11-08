import { expect, mock, test } from 'claude-code/testing'
import type { SessionRateLimit } from 'claude-code'

const NOW = Date.parse('2026-11-08T12:00:00Z')
const MONDAY_NOON = '2026-11-09T12:00:00Z'

const SESSION_MODE = {
  plugin: 'ben',
  surface: 'terminal',
  component: 'SessionMode',
  props: { modes: [] as string[] },
} as const

const measure = (rateLimits: SessionRateLimit[]) => ({
  context: { totalInputTokens: 0, contextWindowSize: 200000 },
  rateLimits,
  changed: ['rateLimits'],
})

test('nothing is drawn before the first reading', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })

  const ui = await $.ui.mount(SESSION_MODE)

  expect(await ui.find({ type: 'Text', text: /5h/ })).toBeUndefined()
  await ui.unmount()
})

test('low usage shows the percentages only, dimmed', async ($, on) => {
  const clock = mock.clock(on)
  await clock.set(NOW)
  on('session.measure', (_, e) => ({ changed: e.changed }))

  await $.session.measure(
    measure([
      { kind: 'five_hour', percentUsed: 48, resetsAt: '2026-11-08T14:10:00Z' },
      { kind: 'seven_day', percentUsed: 12, resetsAt: MONDAY_NOON },
    ]) as never,
  )

  const ui = await $.ui.mount(SESSION_MODE)

  const five = await ui.find({ type: 'Text', text: /^5h/ })
  expect(five?.text).toBe('5h 48%')
  expect(five?.props.dimColor).toBe(true)
  expect((await ui.find({ type: 'Text', text: /^7j/ }))?.text).toBe('7j 12%')
  await ui.unmount()
})

test('from 70% the reset shows, colored by threshold', async ($, on) => {
  const clock = mock.clock(on)
  await clock.set(NOW)
  on('session.measure', (_, e) => ({ changed: e.changed }))

  await $.session.measure(
    measure([
      { kind: 'five_hour', percentUsed: 85, resetsAt: '2026-11-08T12:40:00Z' },
      { kind: 'seven_day', percentUsed: 95, resetsAt: MONDAY_NOON },
    ]) as never,
  )

  const ui = await $.ui.mount(SESSION_MODE)

  const five = await ui.find({ type: 'Text', text: /^5h/ })
  expect(five?.text).toBe('5h 85% ↻0h40')
  expect(five?.props.color).toBe('warning')
  const seven = await ui.find({ type: 'Text', text: /^7j/ })
  expect(seven?.text).toBe('7j 95% ↻lun.')
  expect(seven?.props.color).toBe('error')
  await ui.unmount()
})

test('exactly 90% stays yellow and a rounded 70% shows its reset', async ($, on) => {
  const clock = mock.clock(on)
  await clock.set(NOW)
  on('session.measure', (_, e) => ({ changed: e.changed }))

  await $.session.measure(
    measure([
      { kind: 'five_hour', percentUsed: 69.6, resetsAt: '2026-11-08T12:40:00Z' },
      { kind: 'seven_day', percentUsed: 90, resetsAt: MONDAY_NOON },
    ]) as never,
  )

  const ui = await $.ui.mount(SESSION_MODE)

  const five = await ui.find({ type: 'Text', text: /^5h/ })
  expect(five?.text).toBe('5h 70% ↻0h40')
  expect(five?.props.color).toBe('warning')
  expect((await ui.find({ type: 'Text', text: /^7j/ }))?.props.color).toBe('warning')
  await ui.unmount()
})

test('other surfaces draw the engine modes only', async ($, on) => {
  mock.clock(on)
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })

  await $.session.measure(
    measure([{ kind: 'five_hour', percentUsed: 10 }]) as never,
  )

  const ui = await $.ui.mount({ ...SESSION_MODE, surface: 'desktop' })

  expect(await ui.find({ type: 'Text', text: /^5h/ })).toBeUndefined()
  await ui.unmount()
})

test('the engine modes stay beside the usage', async ($, on) => {
  mock.clock(on)
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>focus</Text>
  })

  await $.session.measure(
    measure([{ kind: 'five_hour', percentUsed: 10 }]) as never,
  )

  const ui = await $.ui.mount({ ...SESSION_MODE, props: { modes: ['focus'] } })

  expect((await ui.find({ type: 'Text', text: /focus/ }))?.text).toBe('focus')
  expect((await ui.find({ type: 'Text', text: /^5h/ }))?.text).toBe('5h 10%')
  await ui.unmount()
})
