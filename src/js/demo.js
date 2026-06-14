//
// @Author: Martin Farkas
// @Email:  info@websites-graphix.com
//

const COMPRESS_MS = 650
const START_DELAY = 150

function compressingText(filename) {
  const isDe = document.documentElement.lang === 'de'
  return isDe ? `Komprimiere ${filename}…` : `Compressing ${filename}…`
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function initDemo() {
  const heroDemo = document.querySelector('.hero-demo')
  const dragzone = heroDemo?.querySelector('.app-dragzone')
  const demoRows = [...document.querySelectorAll('[data-demo-row]')]
  if (!demoRows.length || !heroDemo) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    dragzone?.classList.remove('is--processing')
    demoRows.forEach((row) => {
      row.classList.remove('queued', 'active')
      row.classList.add('done')
      const to = row.querySelector('.demo-to')
      if (to?.dataset.result) to.textContent = to.dataset.result
    })
    return
  }

  let demoRunId = 0
  let demoNeedsRun = true
  let heroDemoVisible = false

  function resetDemoRows() {
    const queuedLabel = heroDemo.dataset.queued ?? '…'
    dragzone?.classList.remove('is--processing')
    demoRows.forEach((row) => {
      row.classList.remove('active', 'done')
      row.classList.add('queued')
      const to = row.querySelector('.demo-to')
      to.textContent = queuedLabel
      to.style.animation = ''
    })
  }

  async function runDemoSequence(runId) {
    await sleep(START_DELAY)
    if (runId !== demoRunId) return

    for (const row of demoRows) {
      const to = row.querySelector('.demo-to')
      const filename = row.dataset.filename ?? ''

      row.classList.remove('queued')
      row.classList.add('active')
      dragzone?.classList.add('is--processing')
      to.textContent = compressingText(filename)
      to.style.animation = ''

      await sleep(COMPRESS_MS)
      if (runId !== demoRunId) return

      to.textContent = to.dataset.result ?? ''
      to.style.animation = 'none'
      row.classList.replace('active', 'done')
    }

    dragzone?.classList.remove('is--processing')
    demoNeedsRun = false
  }

  function scheduleDemo() {
    if (!demoNeedsRun || !heroDemoVisible) return
    demoRunId++
    runDemoSequence(demoRunId)
  }

  resetDemoRows()

  const demoObserver = new IntersectionObserver(
    ([entry]) => {
      heroDemoVisible = entry.isIntersecting && entry.intersectionRatio >= 0.35
      if (heroDemoVisible) scheduleDemo()
    },
    { threshold: 0.35 },
  )
  demoObserver.observe(heroDemo)
}
