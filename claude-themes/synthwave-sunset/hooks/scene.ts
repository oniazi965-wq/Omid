// The backdrop: a striped neon sun sinking behind violet mountains, with a
// glowing grid rolling toward the viewer under a twinkling sky.
//
// Drawn in a 1600×1000 box that is sliced to fit any screen. The horizon sits
// at y = 620. On wide screens the sun and the grid's vanishing point move to
// the right third, away from the words in the middle; on tall ones they sit
// in the centre, where the slice keeps them in view.

const W = 1600
const H = 1000
const HORIZON = 620
const SUN_X = 800
const SUN_Y = 600
const SUN_R = 240

// A small seeded generator so the stars land in the same places every time.
function seeded(seed: number): () => number {
  let s = seed >>> 0

  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0

    return s / 4294967296
  }
}

const n = (value: number): string => String(Math.round(value * 10) / 10)

function stars(): string {
  const rand = seeded(1984)
  const out: string[] = []

  for (let i = 0; i < 90; i++) {
    const x = rand() * W
    // Thinner toward the horizon, where the sky glows.
    const y = Math.pow(rand(), 1.6) * (HORIZON - 150)
    const r = 0.5 + rand() * 1.3
    const twinkles = rand() < 0.55
    const delay = -(rand() * 6)
    const duration = 2.5 + rand() * 4
    const opacity = 0.35 + rand() * 0.6
    const style = twinkles ? ` class="tw" style="animation-duration:${n(duration)}s;animation-delay:${n(delay)}s"` : ''

    out.push(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" opacity="${n(opacity)}"${style}/>`)
  }

  return out.join('')
}

// Bands cut out of the lower sun, drifting down and thickening as they go.
function sunStripes(): string {
  const count = 6
  const duration = 7.2
  const out: string[] = []

  for (let i = 0; i < count; i++) {
    const delay = -((duration / count) * i)

    out.push(
      `<rect class="st" x="${SUN_X - SUN_R - 10}" y="0" width="${SUN_R * 2 + 20}" height="1" style="animation-delay:${n(delay)}s"/>`,
    )
  }

  return out.join('')
}

// Lines running to the vanishing point, drawn from the horizon down.
function gridVertical(): string {
  const vanishY = 560
  const atHorizon = (HORIZON - vanishY) / (H - vanishY)
  const spread = 120
  const out: string[] = []

  for (let k = -60; k <= 60; k++) {
    const bottom = SUN_X + k * spread
    const top = SUN_X + k * spread * atHorizon

    out.push(`<line x1="${n(top)}" y1="${HORIZON}" x2="${n(bottom)}" y2="${H + 20}"/>`)
  }

  return out.join('')
}

// Cross lines rolling toward the viewer, each a glow and a bright core.
function gridHorizontal(): string {
  const count = 10
  const duration = 5
  const out: string[] = []

  for (let i = 0; i < count; i++) {
    const delay = -((duration / count) * i)
    const style = `style="animation-delay:${n(delay)}s"`

    out.push(`<g class="hl" ${style}><line class="hg" x1="-1200" y1="0" x2="${W + 1200}" y2="0"/><line class="hc" x1="-1200" y1="0" x2="${W + 1200}" y2="0"/></g>`)
  }

  return out.join('')
}

const STYLE = `
.tw{animation:twinkle 4s ease-in-out infinite alternate}
@keyframes twinkle{0%{opacity:.15}100%{opacity:1}}
.glow{animation:pulse 7s ease-in-out infinite alternate;transform-origin:${SUN_X}px ${SUN_Y}px;transform-box:view-box}
@keyframes pulse{0%{opacity:.7;transform:scale(.96)}100%{opacity:1;transform:scale(1.04)}}
.st{animation:stripe 7.2s linear infinite}
@keyframes stripe{0%{transform:translateY(${SUN_Y - 150}px) scaleY(.4)}100%{transform:translateY(${HORIZON + 4}px) scaleY(17)}}
.hl{animation:roll 5s cubic-bezier(.55,0,1,.55) infinite}
@keyframes roll{0%{transform:translateY(${HORIZON}px) scaleY(.4);opacity:0}12%{opacity:1}100%{transform:translateY(${H + 30}px) scaleY(3.2);opacity:1}}
.hg{stroke:#ff3fa4;stroke-width:6;stroke-opacity:.22}
.hc{stroke:#ff8fd2;stroke-width:1.4}
.meteor{animation:meteor 17s linear infinite;animation-delay:-9s;opacity:0}
@keyframes meteor{0%{transform:translate(0,0);opacity:0}2%{opacity:1}6%{transform:translate(520px,170px);opacity:0}100%{transform:translate(520px,170px);opacity:0}}
.focus{transform:translateX(300px)}
.sun{transform-origin:${SUN_X}px ${HORIZON}px;transform-box:view-box}
@media (max-aspect-ratio:4/3){.focus{transform:none}}
@media (max-aspect-ratio:3/4){.sun{transform:scale(.72)}}
@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important}.meteor{display:none}}
`

export const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>${STYLE}</style>
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="${HORIZON}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#0a021d"/><stop offset=".34" stop-color="#26093f"/><stop offset=".6" stop-color="#5e1260"/><stop offset=".8" stop-color="#b3206c"/><stop offset=".93" stop-color="#ff5a5f"/><stop offset="1" stop-color="#ff8a4c"/>
</linearGradient>
<linearGradient id="sun" x1="0" y1="${SUN_Y - SUN_R}" x2="0" y2="${SUN_Y + SUN_R * 0.25}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#fff38a"/><stop offset=".38" stop-color="#ffc443"/><stop offset=".72" stop-color="#ff7140"/><stop offset="1" stop-color="#ff2f7e"/>
</linearGradient>
<radialGradient id="glow" cx="${SUN_X}" cy="${SUN_Y}" r="${SUN_R * 2.3}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#ff6fb2" stop-opacity=".6"/><stop offset=".45" stop-color="#ff3d8f" stop-opacity=".2"/><stop offset="1" stop-color="#ff3d8f" stop-opacity="0"/>
</radialGradient>
<linearGradient id="ground" x1="0" y1="${HORIZON}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#2b0a44"/><stop offset=".3" stop-color="#16052c"/><stop offset="1" stop-color="#080112"/>
</linearGradient>
<linearGradient id="haze" x1="0" y1="${HORIZON - 120}" x2="0" y2="${HORIZON}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#ff5aa0" stop-opacity="0"/><stop offset="1" stop-color="#ff5aa0" stop-opacity=".32"/>
</linearGradient>
<linearGradient id="hz" x1="0" y1="${HORIZON - 10}" x2="0" y2="${HORIZON + 10}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#ff7ac6" stop-opacity="0"/><stop offset=".5" stop-color="#ff9ad6" stop-opacity=".9"/><stop offset="1" stop-color="#ff7ac6" stop-opacity="0"/>
</linearGradient>
<linearGradient id="fade" x1="0" y1="${HORIZON}" x2="0" y2="${HORIZON + 110}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/>
</linearGradient>
<linearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/>
</linearGradient>
<mask id="sunMask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
<circle cx="${SUN_X}" cy="${SUN_Y}" r="${SUN_R}" fill="#fff"/>
<g fill="#000">${sunStripes()}</g>
</mask>
<mask id="gridMask" maskUnits="userSpaceOnUse" x="-2000" y="${HORIZON}" width="${W + 4000}" height="${H - HORIZON + 40}">
<rect x="-2000" y="${HORIZON}" width="${W + 4000}" height="${H - HORIZON + 40}" fill="url(#fade)"/>
</mask>
</defs>
<rect width="${W}" height="${HORIZON + 1}" fill="url(#sky)"/>
<g fill="#fff4ff">${stars()}</g>
<g class="meteor"><line x1="180" y1="60" x2="300" y2="99" stroke="url(#trail)" stroke-width="1.6" stroke-linecap="round"/></g>
<rect y="${HORIZON - 120}" width="${W}" height="120" fill="url(#haze)"/>
<g class="focus"><g class="sun">
<circle class="glow" cx="${SUN_X}" cy="${SUN_Y}" r="${SUN_R * 2.3}" fill="url(#glow)"/>
<circle cx="${SUN_X}" cy="${SUN_Y}" r="${SUN_R}" fill="url(#sun)" mask="url(#sunMask)"/>
</g></g>
<path d="M0 ${HORIZON} L0 548 L70 566 L150 520 L240 572 L330 538 L420 584 L520 552 L610 590 L700 574 L800 600 L900 580 L990 598 L1080 566 L1170 590 L1260 548 L1350 578 L1440 528 L1530 560 L1600 540 L1600 ${HORIZON} Z" fill="#1e0838" stroke="#ff4fb0" stroke-opacity=".45" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M-40 ${HORIZON} L-40 470 L60 430 L150 500 L230 455 L330 540 L420 588 L480 ${HORIZON} Z" fill="#12052a" stroke="#c94cff" stroke-opacity=".7" stroke-width="2" stroke-linejoin="round"/>
<path d="M1640 ${HORIZON} L1640 455 L1560 492 L1490 448 L1400 520 L1320 562 L1250 600 L1200 ${HORIZON} Z" fill="#12052a" stroke="#c94cff" stroke-opacity=".7" stroke-width="2" stroke-linejoin="round"/>
<rect y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#ground)"/>
<g mask="url(#gridMask)">
<g class="focus"><g stroke="#ff3fa4" stroke-width="5" stroke-opacity=".18">${gridVertical()}</g><g stroke="#ff8fd2" stroke-width="1.2">${gridVertical()}</g></g>
<g>${gridHorizontal()}</g>
</g>
<rect y="${HORIZON - 10}" width="${W}" height="20" fill="url(#hz)"/>
<rect y="${HORIZON - 1}" width="${W}" height="2" fill="#ffd1ee"/>
</svg>`
