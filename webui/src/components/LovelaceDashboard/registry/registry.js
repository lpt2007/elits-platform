/**
 * Registry za Lovelace Dashboard kartice
 * 
 * Uporaba:
 * import { registerCard } from './registry'
 * 
 * registerCard({
 *   type: 'custom:bubble-card',
 *   name: 'Bubble Card',
 *   component: BubbleCard,
 *   configSchema: { ... }
 * })
 */

const cards = []

export function registerCard(cardConfig) {
  // Preveri da kartica še ni registrirana
  if (cards.find(c => c.type === cardConfig.type)) {
    console.warn(`Card with type "${cardConfig.type}" is already registered`)
    return
  }
  
  cards.push(cardConfig)
}

export function getRegisteredCards() {
  return cards
}

export function getCardByType(type) {
  return cards.find(c => c.type === type)
}
