import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { RingProgress, Text, Group } from '@mantine/core'
import { IconCpu } from '@tabler/icons-react'
import BaseCard from './BaseCard'

export default function CpuCard({ config }) {
  const { data: systemStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: () => axios.get('/observer/system').then(res => res.data),
    refetchInterval: config?.refreshInterval || 5000,
  })

  const cpuUsage = systemStats?.cpu_percent || 0

  return (
    <BaseCard title="CPU Usage" icon={<IconCpu size={20} color="#228be6" />}>
      <Group justify="center">
        <RingProgress
          size={120}
          thickness={12}
          roundCaps
          sections={[{ value: cpuUsage, color: cpuUsage > 80 ? 'red' : cpuUsage > 60 ? 'yellow' : 'blue' }]}
          label={<Text fw={700}>{cpuUsage.toFixed(1)}%</Text>}
        />
      </Group>
    </BaseCard>
  )
}
