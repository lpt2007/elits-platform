import { Container, Title, Card, Text, Group, ActionIcon } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

export default function Repairs() {
  const navigate = useNavigate()
  
  return (
    <Container size="md" py="xl" px="xl">
      <Group mb="xl">
        <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings/system')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>Repairs</Title>
      </Group>
      
      <Card shadow="sm" p="lg" radius="md">
        <Text c="dimmed">No issues detected</Text>
      </Card>
    </Container>
  )
}
