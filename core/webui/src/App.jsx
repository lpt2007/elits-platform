import { Container, Title, Text, Card, SimpleGrid, Group, Badge, Button } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000,
    },
  },
})

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => axios.get('/api/system/stats').then(res => res.data),
  })
  
  const { data: addons } = useQuery({
    queryKey: ['addons'],
    queryFn: () => axios.get('/api/addons').then(res => res.data),
  })
  
  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">Elits Platform Dashboard</Title>
      
      <SimpleGrid cols={3} mb="xl">
        <Card shadow="sm" p="lg">
          <Text size="sm" c="dimmed">CPU Usage</Text>
          <Text size="xl" fw={700}>{stats?.cpu_percent || 0}%</Text>
        </Card>
        
        <Card shadow="sm" p="lg">
          <Text size="sm" c="dimmed">Memory</Text>
          <Text size="xl" fw={700}>{stats?.memory?.percent || 0}%</Text>
        </Card>
        
        <Card shadow="sm" p="lg">
          <Text size="sm" c="dimmed">Disk</Text>
          <Text size="xl" fw={700}>{stats?.disk?.percent || 0}%</Text>
        </Card>
      </SimpleGrid>
      
      <Title order={2} mb="lg">Installed Addons</Title>
      
      <SimpleGrid cols={3}>
        {addons?.map(addon => (
          <Card key={addon.slug} shadow="sm" p="lg">
            <Group justify="space-between" mb="md">
              <Text fw={700}>{addon.name}</Text>
              <Badge color={addon.state === 'running' ? 'green' : 'gray'}>
                {addon.state}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">v{addon.version}</Text>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}
