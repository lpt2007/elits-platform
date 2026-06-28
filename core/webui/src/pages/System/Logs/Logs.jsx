import { Container, Title, Card, Text, Code, Group, ActionIcon } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function Logs() {
  const navigate = useNavigate()
  
  const { data: logs } = useQuery({
    queryKey: ['system-logs'],
    queryFn: () => axios.get('/observer/logs').then(res => res.data),
    refetchInterval: 10000,
  })

  return (
    <Container size="xl" py="xl" px="xl">
      <Group mb="xl">
        <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings/system')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>Logs</Title>
      </Group>
      
      <Card shadow="sm" p="lg" radius="md">
        <Title order={4} mb="md">System Logs</Title>
        <Code block style={{ maxHeight: 500, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: '12px', backgroundColor: '#1a1b1e' }}>
          {logs ? JSON.stringify(logs, null, 2) : 'Loading...'}
        </Code>
      </Card>
    </Container>
  )
}
