import { renderPage } from './handlebars.js'

export function createPaginatedPage(pagesKey, template, { withRelease = false } = {}) {
  const data = {
    pagination: {
      data: `pages.${pagesKey}`,
      size: 1,
      alias: 'page',
    },
    permalink: (pageData) => pageData.page.permalink,
  }

  function render(pageData) {
    return renderPage(template, {
      ...pageData.page,
      site: pageData.site,
      ...(withRelease ? { release: pageData.release } : {}),
    })
  }

  return { data, render }
}
