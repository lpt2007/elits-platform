import { Card, Group, Text, RingProgress } from '@mantine/core'

export default function BubbleCard({ title, value, unit, color, icon }) {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{title}</Text>
          <Text fw={700} size="xl" mt="xs">
            {value} {unit}
          </Text>
        </div>
        <RingProgress 
          size={80} 
          thickness={8} 
          roundCaps 
          sections={[{ value: value, color: color || 'blue' }]} 
          label={icon}
        />
      </Group>
    </Card>
  )
}
