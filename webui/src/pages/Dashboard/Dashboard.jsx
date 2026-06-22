import { Container, Title, Card, Text, Group, SimpleGrid, Badge, ActionIcon } from '@mantine/core'
import { IconCpu, IconDatabase, IconServer, IconActivity } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function Dashboard() {
  const { data: systemStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: () => axios.get('/observer/system').then(res => res.data),
    refetchInterval: 5000,
  })

  const { data: addons } = useQuery({
    queryKey: ['addons'],
    queryFn: () => axios.get('/api/addons').then(res => res.data),
  })

  const runningAddons = addons?.filter(a => a.state === 'running') || []

  return (
    <Container size="xl" py="xl" px="xl">
      <Title order={2} mb="xl">Dashboard</Title>

      <SimpleGrid cols={4} mb="xl">
        <Card shadow="sm" p="lg" radius="md">
          <Group>
            <IconCpu size={32} color="#228be6" />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>CPU</Text>
              <Text fw={700} size="xl">{systemStats?.cpu_percent?.toFixed(1) || 0}%</Text>
            </div>
          </Group>
        </Card>

        <Card shadow="sm" p="lg" radius="md">
          <Group>
            <IconServer size={32} color="#40c057" />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Memory</Text>
              <Text fw={700} size="xl">{systemStats?.memory?.percent?.toFixed(1) || 0}%</Text>
            </div>
          </Group>
        </Card>

        <Card shadow="sm" p="lg" radius="md">
          <Group>
            <IconDatabase size={32} color="#fd7e14" />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Disk</Text>
              <Text fw={700} size="xl">{systemStats?.disk?.percent?.toFixed(1) || 0}%</Text>
            </div>
          </Group>
        </Card>

        <Card shadow="sm" p="lg" radius="md">
          <Group>
            <IconActivity size={32} color="#845ef7" />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Addons</Text>
              <Text fw={700} size="xl">{runningAddons.length} running</Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      <Card shadow="sm" p="lg" radius="md">
        <Title order={4} mb="md">Active Addons</Title>
        <SimpleGrid cols={3}>
          {runningAddons.map(addon => (
            <Card key={addon.slug} shadow="xs" p="md" radius="sm">
              <Group justify="space-between" mb="xs">
                <Text fw={600}>{addon.name}</Text>
                <Badge color="green" size="sm">{addon.state}</Badge>
              </Group>
              <Text size="xs" c="dimmed">v{addon.version}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Card>
    </Container>
  )
}
