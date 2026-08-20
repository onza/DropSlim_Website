const COMPRESS_MS = 1600
const START_DELAY = 500
const SUMMARY_PAUSE_MS = 3000
const POINTER_MOVE_MS = 1400
const POINTER_CLICK_MS = 560
const CONTROL_PAUSE_MS = 1500
const LOOP_PAUSE_MS = 2400
const TYPE_MS = 220
const MENU_PAUSE_MS = 900
const DRAG_START_PAUSE_MS = 700
const DRAG_OVER_PAUSE_MS = 900
const DROP_PAUSE_MS = 500

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
  const settingsBtn = heroDemo?.querySelector('[data-demo-open-settings]')
  const settingsBack = heroDemo?.querySelector('[data-demo-close-settings]')
  const pointer = heroDemo?.querySelector('.demo-pointer')
  const dragFiles = heroDemo?.querySelector('[data-demo-drag-files]')
  const sameFolderToggle = heroDemo?.querySelector('[data-demo-toggle="same-folder"]')
  const minSuffixToggle = heroDemo?.querySelector('[data-demo-toggle="min-suffix"]')
  const limitDimensionsToggle = heroDemo?.querySelector('[data-demo-toggle="limit-dimensions"]')
  const widthInput = heroDemo?.querySelector('[data-demo-control="dimension-width"]')
  const heightInput = heroDemo?.querySelector('[data-demo-control="dimension-height"]')
  const formatPicker = heroDemo?.querySelector('[data-demo-control="format-picker"]')
  const formatValue = heroDemo?.querySelector('[data-demo-format-value]')
  const formatMenu = heroDemo?.querySelector('[data-demo-menu-panel="format"]')
  const localePicker = heroDemo?.querySelector('[data-demo-control="locale-picker"]')
  const localeValue = heroDemo?.querySelector('[data-demo-locale-value]')
  const localeMenu = heroDemo?.querySelector('[data-demo-menu-panel="locale"]')
  const settingsContent = heroDemo?.querySelector('.settings-content')
  const confirmDialog = heroDemo?.querySelector('[data-demo-confirm]')
  const confirmOk = heroDemo?.querySelector('[data-demo-confirm-ok]')
  const demoRows = [...document.querySelectorAll('[data-demo-row]')]
  const demoToggles = [...(heroDemo?.querySelectorAll('[data-demo-control="toggle"]') ?? [])]
  if (!demoRows.length || !heroDemo) return

  const compressingTemplate = heroDemo.dataset.demoCompressing ?? 'Compressing %s…'
  const batchSummaryText = heroDemo.dataset.demoSummary ?? ''

  function compressingText(filename) {
    return compressingTemplate.replace('%s', filename)
  }

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

  function setSettingsMode(active) {
    heroDemo.classList.toggle('is-settings', active)
  }

  function setConfirmVisible(visible) {
    if (!confirmDialog) return
    confirmDialog.classList.toggle('is-hidden', !visible)
    confirmDialog.setAttribute('aria-hidden', visible ? 'false' : 'true')
  }

  function closeMenus() {
    heroDemo.querySelectorAll('[data-demo-menu-panel]').forEach((menu) => {
      menu.classList.add('is-hidden')
    })
    settingsContent?.classList.remove('has-open-menu')
  }

  function endProcessing() {
    dragzone?.classList.remove('is--processing')
    setDragzoneStatus('')
    setCancelVisible(false)
  }

  function syncTogglePanels(control) {
    const isOn = control.classList.contains('is-on')
    const revealId = control.dataset.demoReveal
    if (revealId) {
      heroDemo
        .querySelector(`[data-demo-panel="${revealId}"]`)
        ?.classList.toggle('is-hidden', !isOn)
    }
    const revealOffId = control.dataset.demoRevealOff
    if (revealOffId) {
      heroDemo
        .querySelector(`[data-demo-panel="${revealOffId}"]`)
        ?.classList.toggle('is-hidden', isOn)
    }
  }

  function resetMenu(menu, valueEl) {
    if (!menu) return
    const options = [...menu.querySelectorAll('[data-demo-menu-option]')]
    options.forEach((option, index) => {
      option.classList.toggle('is-selected', index === 0)
    })
    if (valueEl && options[0]) valueEl.textContent = options[0].textContent
    menu.classList.add('is-hidden')
  }

  function resetSettingsControls() {
    demoToggles.forEach((control) => {
      const onByDefault =
        control.dataset.demoToggle === 'same-folder' ||
        control.dataset.demoToggle === 'min-suffix' ||
        control.dataset.demoToggle === 'clear-on-new' ||
        control.dataset.demoToggle === 'auto-check-updates'
      control.classList.toggle('is-on', onByDefault)
      syncTogglePanels(control)
    })

    resetMenu(formatMenu, formatValue)
    resetMenu(localeMenu, localeValue)

    if (widthInput) {
      widthInput.textContent = ''
      widthInput.classList.remove('is-focused')
    }
    if (heightInput) {
      heightInput.textContent = ''
      heightInput.classList.remove('is-focused')
    }

    setConfirmVisible(false)
    closeMenus()
  }

  function hidePointer() {
    if (!pointer) return
    pointer.classList.remove('is-visible', 'is-clicking')
    pointer.hidden = true
  }

  function showPointer() {
    if (!pointer) return
    pointer.hidden = false
    void pointer.offsetWidth
    pointer.classList.add('is-visible')
  }

  function hideDragFiles() {
    if (!dragFiles) return
    dragFiles.classList.remove('is-visible')
    dragFiles.hidden = true
    dragzone?.classList.remove('is-dragover')
    heroDemo.classList.remove('is-drag-setup')
  }

  function showDragFiles() {
    if (!dragFiles) return
    const names = demoRows.map((row) => row.dataset.filename).filter(Boolean)
    dragFiles.innerHTML = names
      .map((name) => `<span class="demo-drag-file">${name}</span>`)
      .join('')
    dragFiles.hidden = false
    void dragFiles.offsetWidth
    dragFiles.classList.add('is-visible')
  }

  async function movePointerToPoint(x, y, runId) {
    if (!pointer) return false
    heroDemo.style.setProperty('--demo-pointer-x', `${Math.max(0, x)}px`)
    heroDemo.style.setProperty('--demo-pointer-y', `${Math.max(0, y)}px`)
    await sleep(POINTER_MOVE_MS)
    return runId === demoRunId
  }

  async function movePointerTo(el, runId) {
    if (!pointer || !el) return false
    scrollDemoControlIntoView(el)
    const demoRect = heroDemo.getBoundingClientRect()
    const targetRect = el.getBoundingClientRect()
    const x = targetRect.left - demoRect.left + targetRect.width / 2 - 4
    const y = targetRect.top - demoRect.top + targetRect.height / 2 - 4
    return movePointerToPoint(x, y, runId)
  }

  function scrollDemoControlIntoView(el) {
    const scroller = el.closest('.settings-content')
    if (!scroller) return

    const scrollerRect = scroller.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    if (elRect.top < scrollerRect.top) {
      scroller.scrollTop -= scrollerRect.top - elRect.top + 12
    } else if (elRect.bottom > scrollerRect.bottom) {
      scroller.scrollTop += elRect.bottom - scrollerRect.bottom + 12
    }
  }

  async function pointerPress(runId) {
    if (!pointer) return false
    pointer.classList.add('is-clicking')
    await sleep(POINTER_CLICK_MS / 2)
    if (runId !== demoRunId) return false
    await sleep(POINTER_CLICK_MS / 2)
    pointer.classList.remove('is-clicking')
    return runId === demoRunId
  }

  async function clickToggle(el, runId) {
    if (!(await movePointerTo(el, runId))) return false
    if (!(await pointerPress(runId))) return false
    el.classList.toggle('is-on')
    syncTogglePanels(el)
    await sleep(CONTROL_PAUSE_MS)
    return runId === demoRunId
  }

  async function typeIntoField(input, runId) {
    if (!input) return runId === demoRunId
    const nextValue = input.dataset.demoValueNext ?? ''
    if (!(await movePointerTo(input, runId))) return false
    if (!(await pointerPress(runId))) return false
    input.classList.add('is-focused')
    input.textContent = ''
    await sleep(CONTROL_PAUSE_MS / 2)
    if (runId !== demoRunId) return false

    for (const char of nextValue) {
      input.textContent += char
      await sleep(TYPE_MS)
      if (runId !== demoRunId) return false
    }

    await sleep(CONTROL_PAUSE_MS / 2)
    input.classList.remove('is-focused')
    return runId === demoRunId
  }

  async function typeDimensionValues(runId) {
    if (!(await typeIntoField(widthInput, runId))) return false
    if (!(await typeIntoField(heightInput, runId))) return false
    await sleep(CONTROL_PAUSE_MS / 2)
    return runId === demoRunId
  }

  async function pickMenuOption({ picker, menu, valueEl, optionIndex }, runId) {
    if (!picker || !menu || !valueEl) return runId === demoRunId
    const options = [...menu.querySelectorAll('[data-demo-menu-option]')]
    const option = options[optionIndex]
    if (!option) return runId === demoRunId

    closeMenus()
    if (!(await movePointerTo(picker, runId))) return false
    if (!(await pointerPress(runId))) return false
    settingsContent?.classList.add('has-open-menu')
    menu.classList.remove('is-hidden')
    await sleep(MENU_PAUSE_MS)
    if (runId !== demoRunId) return false

    if (!(await movePointerTo(option, runId))) return false
    if (!(await pointerPress(runId))) return false
    options.forEach((item) => item.classList.remove('is-selected'))
    option.classList.add('is-selected')
    valueEl.textContent = option.textContent
    closeMenus()
    await sleep(CONTROL_PAUSE_MS)
    return runId === demoRunId
  }

  async function previewMenu(picker, menu, runId) {
    if (!picker || !menu) return runId === demoRunId
    closeMenus()
    if (!(await movePointerTo(picker, runId))) return false
    if (!(await pointerPress(runId))) return false
    settingsContent?.classList.add('has-open-menu')
    menu.classList.remove('is-hidden')
    await sleep(CONTROL_PAUSE_MS + MENU_PAUSE_MS)
    if (runId !== demoRunId) return false
    closeMenus()
    await sleep(CONTROL_PAUSE_MS)
    return runId === demoRunId
  }

  async function disableMinSuffixWithConfirm(runId) {
    if (!minSuffixToggle || !confirmOk) return runId === demoRunId
    if (!(await movePointerTo(minSuffixToggle, runId))) return false
    if (!(await pointerPress(runId))) return false
    setConfirmVisible(true)
    await sleep(CONTROL_PAUSE_MS)
    if (runId !== demoRunId) return false

    if (!(await movePointerTo(confirmOk, runId))) return false
    if (!(await pointerPress(runId))) return false
    setConfirmVisible(false)
    minSuffixToggle.classList.remove('is-on')
    await sleep(CONTROL_PAUSE_MS)
    return runId === demoRunId
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    endProcessing()
    setBatchSummary(batchSummaryText)
    setSettingsMode(false)
    hidePointer()
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
    setSettingsMode(false)
    endProcessing()
    setBatchSummary('')
    hidePointer()
    hideDragFiles()
    resetSettingsControls()
    demoRows.forEach((row) => {
      row.classList.remove('active', 'done')
      row.classList.add('queued')
      const to = row.querySelector('.demo-to')
      to.textContent = queuedLabel
      to.style.animation = ''
    })
  }

  function batchStatusText(done, total, filename) {
    if (total <= 1) {
      return filename ? compressingText(filename) : ''
    }

    const progress = `${done} / ${total}`
    return filename ? `${progress} — ${filename}` : progress
  }

  async function runIntroPhase(runId) {
    setIntroMode(true)
    setSettingsMode(false)
    endProcessing()
    setCancelVisible(false)
    setDragzoneStatus('')
    setBatchSummary('')
    hideDragFiles()

    const demoRect = heroDemo.getBoundingClientRect()
    // Start outside the window so files visibly enter from the right.
    const startX = demoRect.width + 56
    const startY = 110

    heroDemo.classList.add('is-drag-setup')
    heroDemo.style.setProperty('--demo-pointer-x', `${startX}px`)
    heroDemo.style.setProperty('--demo-pointer-y', `${startY}px`)
    showPointer()
    showDragFiles()
    pointer?.classList.add('is-clicking')
    void heroDemo.offsetWidth
    heroDemo.classList.remove('is-drag-setup')

    await sleep(DRAG_START_PAUSE_MS)
    if (runId !== demoRunId) return false

    dragzone?.classList.add('is-dragover')
    if (!(await movePointerTo(dragzone, runId))) return false
    await sleep(DRAG_OVER_PAUSE_MS)
    if (runId !== demoRunId) return false

    pointer?.classList.remove('is-clicking')
    hideDragFiles()
    await sleep(DROP_PAUSE_MS)
    if (runId !== demoRunId) return false

    setIntroMode(false)
    return true
  }

  async function runSettingsWalkthrough(runId) {
    if (!pointer || !settingsBtn || !settingsBack || !sameFolderToggle) {
      return runId === demoRunId
    }

    if (!(await movePointerTo(settingsBtn, runId))) return false
    if (!(await pointerPress(runId))) return false
    setSettingsMode(true)
    settingsContent?.scrollTo({ top: 0 })
    await sleep(CONTROL_PAUSE_MS)
    if (runId !== demoRunId) return false

    if (!(await clickToggle(sameFolderToggle, runId))) return false
    if (!(await clickToggle(sameFolderToggle, runId))) return false

    if (!(await disableMinSuffixWithConfirm(runId))) return false

    if (limitDimensionsToggle) {
      if (!(await clickToggle(limitDimensionsToggle, runId))) return false
    }
    if (!(await typeDimensionValues(runId))) return false

    // Format menu: Original → JPEG (no HEIC)
    if (
      !(await pickMenuOption(
        { picker: formatPicker, menu: formatMenu, valueEl: formatValue, optionIndex: 1 },
        runId,
      ))
    ) {
      return false
    }

    if (!(await previewMenu(localePicker, localeMenu, runId))) return false

    if (!(await movePointerTo(settingsBack, runId))) return false
    if (!(await pointerPress(runId))) return false
    setSettingsMode(false)
    hidePointer()
    await sleep(LOOP_PAUSE_MS)
    return runId === demoRunId
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
    setBatchSummary(batchSummaryText)
    await sleep(SUMMARY_PAUSE_MS)
    if (runId !== demoRunId) return

    const settingsOk = await runSettingsWalkthrough(runId)
    if (!settingsOk || runId !== demoRunId) return

    if (!heroDemoVisible) {
      demoNeedsRun = true
      return
    }

    resetDemoRows()
    demoNeedsRun = true
    scheduleDemo()
  }

  function scheduleDemo() {
    if (!demoNeedsRun || !heroDemoVisible) return
    demoNeedsRun = false
    demoRunId++
    runDemoSequence(demoRunId)
  }

  resetDemoRows()

  const demoObserver = new IntersectionObserver(
    ([entry]) => {
      const wasVisible = heroDemoVisible
      heroDemoVisible = entry.isIntersecting && entry.intersectionRatio >= 0.35
      if (heroDemoVisible) {
        scheduleDemo()
      } else if (wasVisible) {
        demoRunId++
        demoNeedsRun = true
        resetDemoRows()
      }
    },
    { threshold: 0.35 },
  )
  demoObserver.observe(heroDemo)
}
