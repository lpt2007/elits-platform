/**
 * Registry za Pages
 * 
 * Uporaba:
 * import { registerPage } from './registry'
 * 
 * registerPage({
 *   path: '/my-custom-page',
 *   name: 'My Custom Page',
 *   component: MyCustomPageComponent,
 *   order: 100  // Višja številka = kasneje v seznamu
 * })
 */

const pages = []

export function registerPage(pageConfig) {
  // Preveri da stran še ni registrirana
  if (pages.find(p => p.path === pageConfig.path)) {
    console.warn(`Page with path "${pageConfig.path}" is already registered`)
    return
  }
  
  pages.push({
    order: 50,  // Default order
    ...pageConfig
  })
  
  // Sortiraj po order
  pages.sort((a, b) => a.order - b.order)
}

export function getRegisteredPages() {
  return pages
}
