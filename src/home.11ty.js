import { createPaginatedPage } from './lib/paginated-page.js'

export const { data, render } = createPaginatedPage('home', 'home', { withRelease: true })
