import type { ThemeSetArgs } from 'claude-code'
import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'synthwave-sunset',
  component: 'Backdrop',
  props: {
    scene: 'synthwave-sunset',
    plugin: 'synthwave-sunset',
    glass: { blur: 18, tint: '#150a26', opacity: 0.6 },
  },
} as const

test('the session starts in the synthwave look, with its scene behind it', async ($, on) => {
  let sent: ThemeSetArgs | undefined

  on('theme.set', (_, e) => {
    sent = e

    return { value: { isDrawn: true, requestId: 'look' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  expect(sent?.backdrop).toEqual({
    scene: 'synthwave-sunset',
    glass: { blur: 18, tint: '#150a26', opacity: 0.6 },
  })
  expect(sent?.colors).toBeDefined()
})

test('the scene draws on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })
    const svg = await ui.find({ type: 'Svg' })

    expect(svg).toBeDefined()
    await ui.unmount()
  }
})
