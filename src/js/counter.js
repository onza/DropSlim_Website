//
// @Author: Martin Farkas
// @Email:  info@websites-graphix.com
//

export function initCounter() {
  const statEl = document.querySelector('[data-count]')
  if (!statEl) return

  const target = Number(statEl.dataset.count)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()

      if (prefersReducedMotion) {
        statEl.textContent = String(target)
        return
      }

      const start = performance.now()
      const duration = 1200
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1)
        const eased = 1 - (1 - t) ** 3
        statEl.textContent = Math.round(eased * target)
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    },
    { threshold: 0.5 },
  )
  observer.observe(statEl)
}
