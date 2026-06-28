import { SimpleGrid, Card, Text, RingProgress, Group } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { IconCpu, IconServer, IconDatabase } from '@tabler/icons-react'

export default function DefaultDashboard() {
  const { data: systemStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: () => axios.get('/observer/system').then(res => res.data),
    refetchInterval: 5000,
  })

  return (
    <SimpleGrid cols={3}>
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>CPU Usage</Text>
            <Text fw={700} size="xl" mt="xs">{systemStats?.cpu_percent?.toFixed(1) || 0}%</Text>
          </div>
          <RingProgress 
            size={80} 
            thickness={8} 
            roundCaps 
            sections={[{ value: systemStats?.cpu_percent || 0, color: 'blue' }]} 
            label={<IconCpu size={24} />} 
          />
        </Group>
      </Card>

      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Memory Usage</Text>
            <Text fw={700} size="xl" mt="xs">{systemStats?.memory?.percent?.toFixed(1) || 0}%</Text>
            <Text size="xs" c="dimmed" mt="xs">
              {((systemStats?.memory?.total - systemStats?.memory?.available) / 1024 / 1024 / 1024).toFixed(1)} GB / 
              {(systemStats?.memory?.total / 1024 / 1024 / 1024).toFixed(1)} GB
            </Text>
          </div>
          <RingProgress 
            size={80} 
            thickness={8} 
            roundCaps 
            sections={[{ value: systemStats?.memory?.percent || 0, color: 'green' }]} 
            label={<IconServer size={24} />} 
          />
        </Group>
      </Card>

      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Disk Usage</Text>
            <Text fw={700} size="xl" mt="xs">{systemStats?.disk?.percent?.toFixed(1) || 0}%</Text>
            <Text size="xs" c="dimmed" mt="xs">
              {(systemStats?.disk?.used / 1024 / 1024 / 1024).toFixed(1)} GB / 
              {(systemStats?.disk?.total / 1024 / 1024 / 1024).toFixed(1)} GB
            </Text>
          </div>
          <RingProgress 
            size={80} 
            thickness={8} 
            roundCaps 
            sections={[{ value: systemStats?.disk?.percent || 0, color: 'orange' }]} 
            label={<IconDatabase size={24} />} 
          />
        </Group>
      </Card>
    </SimpleGrid>
  )
}
