import { Container, Title, SimpleGrid, Card, Text, Group, Badge, Button, TextInput, ActionIcon, Tabs, Stack } from '@mantine/core'
import { IconArrowLeft, IconDownload, IconSearch, IconServer, IconApps, IconTrash } from '@tabler/icons-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'

export default function AppStore() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('system')

  const { data: addons, refetch } = useQuery({
    queryKey: ['store'],
    queryFn: () => axios.get('/api/store').then(res => res.data),
  })

  const installMutation = useMutation({
    mutationFn: (slug) => axios.post('/api/store/install', { slug }),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Addon installed successfully', color: 'green' })
      refetch()
    },
    onError: (error) => {
      notifications.show({ title: 'Error', message: error.response?.data?.detail || 'Failed to install', color: 'red' })
    },
  })

  const uninstallMutation = useMutation({
    mutationFn: (slug) => axios.post(`/api/addons/${slug}/uninstall`),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Addon uninstalled successfully', color: 'green' })
      refetch()
    },
    onError: (error) => {
      notifications.show({ title: 'Error', message: error.response?.data?.detail || 'Failed to uninstall', color: 'red' })
    },
  })

  // Filtriraj addone po kategoriji in iskanju
  const filteredAddons = addons?.filter(addon => {
    const matchesSearch = addon.name.toLowerCase().includes(search.toLowerCase()) ||
                         addon.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = addon.type === activeTab
    return matchesSearch && matchesCategory
  })

  // Število addonov po kategoriji
  const systemCount = addons?.filter(a => a.type === 'system').length || 0
  const appsCount = addons?.filter(a => a.type === 'apps').length || 0

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

      <Tabs value={activeTab} onChange={setActiveTab} mb="lg">
        <Tabs.List>
          <Tabs.Tab value="system" leftSection={<IconServer size={16} />}>
            System ({systemCount})
          </Tabs.Tab>
          <Tabs.Tab value="apps" leftSection={<IconApps size={16} />}>
            Apps ({appsCount})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="system" pt="md">
          <Stack>
            {filteredAddons?.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">No system addons found</Text>
            ) : (
              <SimpleGrid cols={3}>
                {filteredAddons?.map(addon => (
                  <AddonCard 
                    key={addon.slug} 
                    addon={addon} 
                    installMutation={installMutation}
                    uninstallMutation={uninstallMutation}
                  />
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="apps" pt="md">
          <Stack>
            {filteredAddons?.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">No apps found</Text>
            ) : (
              <SimpleGrid cols={3}>
                {filteredAddons?.map(addon => (
                  <AddonCard 
                    key={addon.slug} 
                    addon={addon} 
                    installMutation={installMutation}
                    uninstallMutation={uninstallMutation}
                  />
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}

function AddonCard({ addon, installMutation, uninstallMutation }) {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={700}>{addon.name}</Text>
        <Badge color={addon.stage === 'stable' ? 'green' : 'yellow'} size="sm">{addon.stage}</Badge>
      </Group>

      <Text size="sm" c="dimmed" mb="md">{addon.description}</Text>

      <Group justify="space-between">
        <Text size="xs" c="dimmed">v{addon.version}</Text>
        {addon.installed ? (
          <Button
            leftSection={<IconTrash size={16} />}
            color="red"
            variant="light"
            onClick={() => {
              if (window.confirm(`Are you sure you want to uninstall ${addon.name}?`)) {
                uninstallMutation.mutate(addon.slug)
              }
            }}
            loading={uninstallMutation.isPending}
            size="xs"
          >
            Uninstall
          </Button>
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
  )
}
