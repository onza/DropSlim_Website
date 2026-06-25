export function initLangDropdown() {
  const dropdown = document.querySelector('.lang-dropdown')
  if (!dropdown) return

  dropdown.addEventListener('toggle', () => {
    if (!dropdown.open) return
    dropdown.querySelector('.lang-link')?.focus()
  })

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Node) || dropdown.contains(event.target)) return
    dropdown.open = false
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') dropdown.open = false
  })
}
