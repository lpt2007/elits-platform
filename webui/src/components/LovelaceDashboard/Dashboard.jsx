import { SimpleGrid } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { getRegisteredCards } from './registry/registry'

export default function LovelaceDashboard({ config }) {
  const { data: dashboardConfig, isLoading } = useQuery({
    queryKey: ['dashboard-config'],
    queryFn: () => axios.get('/api/dashboard/config').then(res => res.data),
    enabled: !!config?.useApi,
  })

  const cards = getRegisteredCards()
  const layout = config?.layout || dashboardConfig?.layout || []

  if (isLoading) {
    return <div>Loading dashboard...</div>
  }

  // Renderiraj kartice po layoutu
  const renderCards = () => {
    if (layout.length === 0) {
      // Default layout - prikaži vse kartice
      return cards.map((card, index) => {
        const CardComponent = card.component
        return <CardComponent key={index} config={card.config} />
      })
    }

    // Custom layout
    return layout.map((cardConfig, index) => {
      const card = cards.find(c => c.type === cardConfig.type)
      if (!card) return null
      
      const CardComponent = card.component
      return <CardComponent key={index} config={{ ...card.config, ...cardConfig.config }} />
    })
  }

  return (
    <SimpleGrid cols={config?.columns || 4}>
      {renderCards()}
    </SimpleGrid>
  )
}
