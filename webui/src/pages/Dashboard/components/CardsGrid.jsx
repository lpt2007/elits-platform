import { SimpleGrid, Card, Text } from '@mantine/core'
import CPUCard from '../../../components/DashboardCards/CPUCard'
import MemoryCard from '../../../components/DashboardCards/MemoryCard'
import DiskCard from '../../../components/DashboardCards/DiskCard'
import AddonsCard from '../../../components/DashboardCards/AddonsCard'
import { useEntities } from '../../../contexts/EntityContext'

// Generic Entity Card
function EntityCard({ entity, title }) {
  const { getEntity } = useEntities()
  const entityData = getEntity(entity)
  
  if (!entityData) {
    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Text c="dimmed">Entity not found: {entity}</Text>
      </Card>
    )
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        {title || entityData.attributes?.friendly_name || entity}
      </Text>
      <Text fw={700} size="xl" mt="xs">
        {entityData.state} {entityData.attributes?.unit_of_measurement || ''}
      </Text>
    </Card>
  )
}

// Gauge Card
function GaugeCard({ entity, title, min = 0, max = 100 }) {
  const { getEntity } = useEntities()
  const entityData = getEntity(entity)
  const value = parseFloat(entityData?.state || 0)
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        {title || entityData?.attributes?.friendly_name || entity}
      </Text>
      <Text fw={700} size="xl" mt="xs">
        {value} {entityData?.attributes?.unit_of_measurement || ''}
      </Text>
      <div style={{ 
        marginTop: '12px', 
        height: '8px', 
        backgroundColor: '#373a40', 
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: percentage > 80 ? '#fa5252' : percentage > 60 ? '#fcc419' : '#40c057',
        }} />
      </div>
    </Card>
  )
}

// Bubble Card
function BubbleCard({ entity, title, icon }) {
  const { getEntity } = useEntities()
  const entityData = getEntity(entity)
  const isOn = entityData?.state === 'on'

  return (
    <Card 
      shadow="sm" 
      p="lg" 
      radius="md" 
      withBorder
      style={{
        backgroundColor: isOn ? 'rgba(34, 139, 230, 0.1)' : undefined,
        border: isOn ? '1px solid #228be6' : undefined
      }}
    >
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title || entityData?.attributes?.friendly_name || entity}
          </Text>
          <Text fw={700} size="xl" mt="xs">
            {entityData?.state || 'unknown'}
          </Text>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: isOn ? '#228be6' : '#495057',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon || '💡'}
        </div>
      </Group>
    </Card>
  )
}

export default function CardsGrid({ cards }) {
  const renderCard = (card, index) => {
    switch (card.type) {
      case 'custom:cpu-card': return <CPUCard key={index} />
      case 'custom:memory-card': return <MemoryCard key={index} />
      case 'custom:disk-card': return <DiskCard key={index} />
      case 'custom:addons-card': return <AddonsCard key={index} />
      case 'entity': return <EntityCard key={index} entity={card.entity} title={card.title} />
      case 'gauge': return <GaugeCard key={index} entity={card.entity} title={card.title} min={card.min} max={card.max} />
      case 'custom:bubble-card': return <BubbleCard key={index} entity={card.entity} title={card.title} icon={card.icon} />
      default:
        return (
          <Card key={index} shadow="sm" p="lg" radius="md" withBorder style={{ border: '2px dashed #666' }}>
            <Text c="dimmed" ta="center">Unknown card type: {card.type}</Text>
          </Card>
        )
    }
  }

  return (
    <SimpleGrid cols={4}>
      {cards.map((card, index) => renderCard(card, index))}
    </SimpleGrid>
  )
}
