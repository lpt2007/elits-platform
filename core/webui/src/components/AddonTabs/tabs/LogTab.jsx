import { Card, Title, Code } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function LogTab({ addon }) {
  const { data: logs } = useQuery({
    queryKey: ['addon-logs', addon.slug],
    queryFn: () => axios.get(`/api/addons/${addon.slug}/logs`).then(res => res.data),
    refetchInterval: 5000,
  })

  return (
    <Card shadow="sm" p="lg" radius="md">
      <Title order={4} mb="md">Logs</Title>
      <Code block style={{ maxHeight: 400, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: '12px', backgroundColor: '#1a1b1e' }}>
        {logs?.logs?.join('\n') || 'No logs available'}
      </Code>
    </Card>
  )
}
