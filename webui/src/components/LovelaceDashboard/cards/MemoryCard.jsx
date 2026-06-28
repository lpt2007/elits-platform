import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { RingProgress, Text, Group } from '@mantine/core'
import { IconServer } from '@tabler/icons-react'
import BaseCard from './BaseCard'

export default function MemoryCard({ config }) {
  const { data: systemStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: () => axios.get('/observer/system').then(res => res.data),
    refetchInterval: config?.refreshInterval || 5000,
  })

  const memoryUsage = systemStats?.memory?.percent || 0
  const memoryUsed = ((systemStats?.memory?.total - systemStats?.memory?.available) / 1024 / 1024 / 1024).toFixed(1)
  const memoryTotal = (systemStats?.memory?.total / 1024 / 1024 / 1024).toFixed(1)

  return (
    <BaseCard title="Memory Usage" icon={<IconServer size={20} color="#40c057" />}>
      <Group justify="center">
        <RingProgress
          size={120}
          thickness={12}
          roundCaps
          sections={[{ value: memoryUsage, color: memoryUsage > 80 ? 'red' : memoryUsage > 60 ? 'yellow' : 'green' }]}
          label={<Text fw={700}>{memoryUsage.toFixed(1)}%</Text>}
        />
      </Group>
      <Text size="sm" c="dimmed" mt="md" ta="center">
        {memoryUsed} GB / {memoryTotal} GB
      </Text>
    </BaseCard>
  )
}
