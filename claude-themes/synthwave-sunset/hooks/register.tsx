import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene'

// Night after a neon sunset: violet surfaces, hot-pink accents, sunset-amber
// warnings and a teal-green for success. Made for dark mode alone, to match
// the scene behind it.
const { theme, problems } = makeColors({
  label: 'Synthwave sunset',
  only: 'dark',
  roles: { accent: '#ff3fa4', danger: '#ff4a3d', success: '#3ef0b0', warning: '#ffb238', pro: '#a36bff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#150a26',
        'surface-1': '#1c0f31',
        'surface-2': '#22133a',
        'surface-3': '#281742',
        'text-primary': '#fdeefe',
        'text-secondary': '#e0c8f2',
        'text-muted': '#b9a2d4',
      },
    },
    git: {
      added: '#3ef0b0',
      removed: '#ff4a3d',
      modified: '#ffb238',
      merged: '#c49bff',
      closed: '#ff7a70',
      conflicting: '#ff7a2f',
      draft: '#c3b2dc',
    },
  },
})

const SCENE_NAME = 'synthwave-sunset'

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: {
    scene: SCENE_NAME,
    glass: { blur: 18, tint: '#150a26', opacity: 0.6 },
  },
}

// A RegExp, since the tool's name is typed only once the engine has listed it.
const CHECK_TOOL = /^mcp__synthwave-sunset__theme_check$/

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }
    await $.tool.register({
      name: 'theme_check',
      description:
        'Sends the Synthwave Sunset theme again and reports whether an attached app draws it: the surfaces attached, isDrawn and its reason.',
    })

    return next(e)
  })

  // Sends the look again and says what the engine answered, to find out why
  // someone can't see it.
  on('tool.call', { tool: CHECK_TOOL }, async $ => {
    const set = await $.theme.set(LOOK)
    const surfaces = await $.session.surfaces()
    const version = await $.session.version()

    return {
      result: JSON.stringify({
        surfaces,
        isDrawn: set.isDrawn,
        reason: set.isDrawn ? undefined : set.reason,
        engine: version.version,
        paletteProblems: problems,
      }),
    }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== SCENE_NAME) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={SCENE}
        alt="A striped neon sun setting behind violet mountains over a glowing grid"
        isInteractive
      />
    )
  })
}
