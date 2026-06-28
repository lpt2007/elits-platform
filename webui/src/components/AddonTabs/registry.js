/**
 * Registry za AddonDetails tabs
 * 
 * Uporaba:
 * import { registerTab } from './registry'
 * 
 * registerTab({
 *   id: 'my-custom-tab',
 *   label: 'My Custom Tab',
 *   icon: IconCustom,
 *   component: MyCustomTabComponent,
 *   order: 100  // Višja številka = kasneje v seznamu
 * })
 */

const tabs = []

export function registerTab(tabConfig) {
  // Preveri da tab še ni registriran
  if (tabs.find(t => t.id === tabConfig.id)) {
    console.warn(`Tab with id "${tabConfig.id}" is already registered`)
    return
  }
  
  tabs.push({
    order: 50,  // Default order
    ...tabConfig
  })
  
  // Sortiraj po order
  tabs.sort((a, b) => a.order - b.order)
}

export function getRegisteredTabs() {
  return tabs
}
