import { Card, Text } from '@mantine/core'

export default function HACard({ type, config }) {
  // Tukaj bo integracija z HA Lovelace karticami
  // Zaenkrat samo placeholder
  
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text fw={600} mb="md">HA Card: {type}</Text>
      <Text size="sm" c="dimmed">Config: {JSON.stringify(config)}</Text>
    </Card>
  )
}
