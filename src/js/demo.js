//
// @Author: Martin Farkas
// @Email:  info@websites-graphix.com
//

const COMPRESS_MS = 650
const START_DELAY = 150
const INTRO_MS = 1400

function isDe() {
  return document.documentElement.lang === 'de'
}

function compressingText(filename) {
  return isDe() ? `Komprimiere ${filename}…` : `Compressing ${filename}…`
}

function batchStatusText(done, total, filename) {
  if (total <= 1) {
    return filename ? compressingText(filename) : ''
  }

  const progress = `${done} / ${total}`
  return filename ? `${progress} — ${filename}` : progress
}

function batchSummaryText() {
  return isDe() ? '4 Bilder · 17,8 MB gespart (83%)' : '4 images · saved 17.8 MB (83%)'
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function initDemo() {
  const heroDemo = document.querySelector('.hero-demo')
  const dragzone = heroDemo?.querySelector('.app-dragzone')
  const dragzoneStatus = heroDemo?.querySelector('.dragzone-status')
  const batchSummary = heroDemo?.querySelector('.batch-summary')
  const cancelBtn = heroDemo?.querySelector('.demo-cancel')
  const demoRows = [...document.querySelectorAll('[data-demo-row]')]
  if (!demoRows.length || !heroDemo) return

  function setDragzoneStatus(message) {
    if (!dragzoneStatus) return
    dragzoneStatus.textContent = message
    dragzoneStatus.hidden = !message
  }

  function setBatchSummary(message) {
    if (!batchSummary) return
    batchSummary.textContent = message
    batchSummary.hidden = !message
  }

  function setCancelVisible(visible) {
    if (!cancelBtn) return
    cancelBtn.hidden = !visible
  }

  function setIntroMode(active) {
    heroDemo.classList.toggle('is-intro', active)
  }

  function endProcessing() {
    dragzone?.classList.remove('is--processing')
    setDragzoneStatus('')
    setCancelVisible(false)
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    endProcessing()
    setBatchSummary(batchSummaryText())
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
    setIntroMode(true)
    endProcessing()
    setBatchSummary('')
    demoRows.forEach((row) => {
      row.classList.remove('active', 'done')
      row.classList.add('queued')
      const to = row.querySelector('.demo-to')
      to.textContent = queuedLabel
      to.style.animation = ''
    })
  }

  async function runIntroPhase(runId) {
    setIntroMode(true)
    dragzone?.classList.add('is--processing')
    setCancelVisible(false)
    setDragzoneStatus('')
    setBatchSummary('')

    await sleep(INTRO_MS)
    if (runId !== demoRunId) return false

    setIntroMode(false)
    return true
  }

  async function runDemoSequence(runId) {
    await sleep(START_DELAY)
    if (runId !== demoRunId) return

    const introOk = await runIntroPhase(runId)
    if (!introOk) {
      endProcessing()
      setIntroMode(true)
      return
    }

    const total = demoRows.length
    let done = 0

    dragzone?.classList.add('is--processing')
    setCancelVisible(true)
    setDragzoneStatus(batchStatusText(done, total))

    for (const row of demoRows) {
      const to = row.querySelector('.demo-to')
      const filename = row.dataset.filename ?? ''

      setDragzoneStatus(batchStatusText(done, total, filename))

      row.classList.remove('queued')
      row.classList.add('active')
      to.textContent = compressingText(filename)
      to.style.animation = ''

      await sleep(COMPRESS_MS)
      if (runId !== demoRunId) {
        endProcessing()
        setIntroMode(true)
        return
      }

      to.textContent = to.dataset.result ?? ''
      to.style.animation = 'none'
      row.classList.replace('active', 'done')
      done += 1
      setDragzoneStatus(batchStatusText(done, total))
    }

    endProcessing()
    setBatchSummary(batchSummaryText())
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
