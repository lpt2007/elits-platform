import { registerCard } from './registry'
import CpuCard from '../cards/CpuCard'
import MemoryCard from '../cards/MemoryCard'

// Registriraj kartice
registerCard({
  type: 'cpu-card',
  name: 'CPU Card',
  component: CpuCard,
  config: {
    refreshInterval: 5000
  }
})

registerCard({
  type: 'memory-card',
  name: 'Memory Card',
  component: MemoryCard,
  config: {
    refreshInterval: 5000
  }
})

export { registerCard, getRegisteredCards } from './registry'
