import { Container, Title, Card, Text, Badge, Group, Button, ActionIcon } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Updates() {
  const navigate = useNavigate()

  const { data: addons, isLoading } = useQuery({
    queryKey: ['updates'],
    queryFn: () => axios.get('/observer/updates').then(res => res.data),
  })

  const updates = addons?.filter(a => a.update_available) || []

  return (
    <Container size="md" py="xl" px="xl">
      <Group mb="xl">
        <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings/system')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>Updates</Title>
      </Group>

      {isLoading ? (
        <Card shadow="sm" p="lg" radius="md">
          <Text c="dimmed">Loading...</Text>
        </Card>
      ) : updates.length === 0 ? (
        <Card shadow="sm" p="lg" radius="md">
          <Text c="dimmed">All addons are up to date</Text>
        </Card>
      ) : (
        updates.map(addon => (
          <Card key={addon.slug} shadow="sm" p="lg" mb="sm" radius="md">
            <Group justify="space-between">
              <div>
                <Text fw={700}>{addon.name}</Text>
                <Text size="sm" c="dimmed">v{addon.current_version} → v{addon.available_version}</Text>
              </div>
              <Button size="xs">Update</Button>
            </Group>
          </Card>
        ))
      )}
    </Container>
  )
}
