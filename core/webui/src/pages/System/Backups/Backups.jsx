import { Container, Title, Card, Text, Button, Group, ActionIcon } from '@mantine/core'
import { IconArrowLeft, IconPlus } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

export default function Backups() {
  const navigate = useNavigate()
  
  return (
    <Container size="xl" py="xl" px="xl">
      <Group mb="xl">
        <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings/system')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>Backups</Title>
      </Group>
      
      <Group justify="space-between" mb="lg">
        <Button leftSection={<IconPlus size={16} />} size="sm">Create Backup</Button>
      </Group>
      
      <Card shadow="sm" p="lg" radius="md">
        <Text c="dimmed">No backups yet</Text>
      </Card>
    </Container>
  )
}
