import { Container, Title, TextInput, SimpleGrid, Card, Text, Group, Badge, Button, ActionIcon } from '@mantine/core'
import { IconPlayerPlay, IconPlayerStop, IconRefresh, IconSearch, IconPackage, IconArrowLeft } from '@tabler/icons-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'

export default function Apps() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: addons, refetch } = useQuery({
    queryKey: ['addons'],
    queryFn: () => axios.get('/api/addons').then(res => res.data),
  })

  // Ne filtriraj po manifest - prikaži vse addon-e
  const filteredAddons = (addons || []).filter(addon =>
    addon.name?.toLowerCase().includes(search.toLowerCase()) ||
    addon.slug?.toLowerCase().includes(search.toLowerCase())
  )

  const startMutation = useMutation({
    mutationFn: (slug) => axios.post(`/api/addons/${slug}/start`),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Addon started', color: 'green' })
      refetch()
    },
  })

  const stopMutation = useMutation({
    mutationFn: (slug) => axios.post(`/api/addons/${slug}/stop`),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Addon stopped', color: 'green' })
      refetch()
    },
  })

  const restartMutation = useMutation({
    mutationFn: (slug) => axios.post(`/api/addons/${slug}/restart`),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Addon restarted', color: 'green' })
      refetch()
    },
  })

  return (
    <Container size="xl" py="xl" px="xl">
      <Group mb="lg">
        <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>Apps</Title>
      </Group>

      <TextInput
        placeholder="Search"
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb="lg"
        size="lg"
      />

      {filteredAddons.length === 0 ? (
        <Card shadow="sm" p="xl" radius="md">
          <Group>
            <IconPackage size={32} opacity={0.5} />
            <div>
              <Text fw={500}>No apps installed</Text>
              <Text size="sm" c="dimmed" mt="xs">Click "Install app" to browse the app store.</Text>
            </div>
          </Group>
        </Card>
      ) : (
        <SimpleGrid cols={3}>
          {filteredAddons.map(addon => (
            <Card
              key={addon.slug}
              shadow="sm"
              p="lg"
              radius="md"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/settings/apps/${addon.slug}`)}
            >
              <Group justify="space-between" mb="md">
                <Group gap="sm">
                  <IconPackage size={28} />
                  <div>
                    <Text fw={600}>{addon.name}</Text>
                    <Text size="xs" c="dimmed">v{addon.version}</Text>
                  </div>
                </Group>
                <Badge color={addon.state === 'running' ? 'green' : 'gray'} size="sm">{addon.state}</Badge>
              </Group>

              <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
                Status: {addon.status || 'unknown'}
              </Text>

              <Group gap="xs" justify="flex-end" onClick={(e) => e.stopPropagation()}>
                {addon.state === 'running' ? (
                  <>
                    <ActionIcon color="yellow" variant="light" onClick={() => stopMutation.mutate(addon.slug)}>
                      <IconPlayerStop size={16} />
                    </ActionIcon>
                    <ActionIcon color="blue" variant="light" onClick={() => restartMutation.mutate(addon.slug)}>
                      <IconRefresh size={16} />
                    </ActionIcon>
                  </>
                ) : (
                  <ActionIcon color="green" variant="light" onClick={() => startMutation.mutate(addon.slug)}>
                    <IconPlayerPlay size={16} />
                  </ActionIcon>
                )}
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Button
        style={{ position: 'fixed', bottom: 20, right: 20 }}
        size="lg"
        onClick={() => navigate('/settings/apps/store')}
      >
        Install app
      </Button>
    </Container>
  )
}
