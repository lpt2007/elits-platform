import { Container, Title, Text, Card, Group, ActionIcon } from '@mantine/core'
import { IconArrowLeft, IconHammer } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

export default function DeveloperTools() {
  const navigate = useNavigate()

  return (
    <Container size="md" py="xl" px="xl">
      <Group mb="xl">
        <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>Developer Tools</Title>
      </Group>

      <Card shadow="sm" p="xl" radius="md" style={{ textAlign: 'center' }}>
        <IconHammer size={48} opacity={0.5} style={{ margin: '0 auto 20px' }} />
        <Title order={3} mb="md">Under Construction</Title>
        <Text c="dimmed">This feature is coming soon</Text>
      </Card>
    </Container>
  )
}
