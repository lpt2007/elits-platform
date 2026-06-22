import { Container, Title, SimpleGrid, Card, Text, Group, Badge, Button, TextInput, ActionIcon } from '@mantine/core'
import { IconArrowLeft, IconDownload, IconSearch } from '@tabler/icons-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'

export default function AppStore() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  
  const { data: addons, refetch } = useQuery({
    queryKey: ['store'],
    queryFn: () => axios.get('/api/store').then(res => res.data),
  })
  
  const installMutation = useMutation({
    mutationFn: (slug) => axios.post('/api/store/install', { slug, repository: 'official' }),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Addon installed successfully', color: 'green' })
      refetch()
    },
    onError: (error) => {
      notifications.show({ title: 'Error', message: error.response?.data?.detail || 'Failed to install', color: 'red' })
    },
  })
  
  const filteredAddons = addons?.filter(addon => 
    addon.name.toLowerCase().includes(search.toLowerCase()) ||
    addon.description.toLowerCase().includes(search.toLowerCase())
  )
  
  return (
    <Container size="xl" py="xl" px="xl">
      <Group mb="lg">
        <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings/apps')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>App Store</Title>
      </Group>
      
      <TextInput
        placeholder="Search apps..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb="lg"
        size="lg"
      />
      
      <SimpleGrid cols={3}>
        {filteredAddons?.map(addon => (
          <Card key={addon.slug} shadow="sm" p="lg" radius="md">
            <Group justify="space-between" mb="md">
              <Text fw={700}>{addon.name}</Text>
              <Badge color={addon.stage === 'stable' ? 'green' : 'yellow'} size="sm">{addon.stage}</Badge>
            </Group>
            
            <Text size="sm" c="dimmed" mb="md">{addon.description}</Text>
            
            <Group justify="space-between">
              <Text size="xs" c="dimmed">{addon.category}</Text>
              {addon.installed ? (
                <Badge color="blue" size="sm">Installed</Badge>
              ) : (
                <Button
                  leftSection={<IconDownload size={16} />}
                  onClick={() => installMutation.mutate(addon.slug)}
                  loading={installMutation.isPending}
                  size="xs"
                >
                  Install
                </Button>
              )}
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  )
}
