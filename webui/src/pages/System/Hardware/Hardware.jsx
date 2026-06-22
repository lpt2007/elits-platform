import { Container, Title, Card, Text, Table, Group, ActionIcon, Grid, RingProgress } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconCpu, IconServer, IconDatabase } from '@tabler/icons-react'

export default function Hardware() {
  const navigate = useNavigate()
  
  const { data: systemStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: () => axios.get('/observer/system').then(res => res.data),
    refetchInterval: 5000,
  })

  return (
    <Container size="xl" py="xl" px="xl">
      <Group mb="xl">
        <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings/system')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>Hardware</Title>
      </Group>
      
      <Grid mb="lg">
        <Grid.Col span={4}>
          <Card shadow="sm" p="lg" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>CPU Usage</Text>
                <Text fw={700} size="xl" mt="xs">{systemStats?.cpu_percent?.toFixed(1) || 0}%</Text>
              </div>
              <RingProgress size={80} thickness={8} roundCaps sections={[{ value: systemStats?.cpu_percent || 0, color: 'blue' }]} label={<IconCpu size={24} />} />
            </Group>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={4}>
          <Card shadow="sm" p="lg" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Memory Usage</Text>
                <Text fw={700} size="xl" mt="xs">{systemStats?.memory?.percent?.toFixed(1) || 0}%</Text>
                <Text size="xs" c="dimmed" mt="xs">{((systemStats?.memory?.total - systemStats?.memory?.available) / 1024 / 1024 / 1024).toFixed(1)} GB / {(systemStats?.memory?.total / 1024 / 1024 / 1024).toFixed(1)} GB</Text>
              </div>
              <RingProgress size={80} thickness={8} roundCaps sections={[{ value: systemStats?.memory?.percent || 0, color: 'green' }]} label={<IconServer size={24} />} />
            </Group>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={4}>
          <Card shadow="sm" p="lg" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Disk Usage</Text>
                <Text fw={700} size="xl" mt="xs">{systemStats?.disk?.percent?.toFixed(1) || 0}%</Text>
                <Text size="xs" c="dimmed" mt="xs">{(systemStats?.disk?.used / 1024 / 1024 / 1024).toFixed(1)} GB / {(systemStats?.disk?.total / 1024 / 1024 / 1024).toFixed(1)} GB</Text>
              </div>
              <RingProgress size={80} thickness={8} roundCaps sections={[{ value: systemStats?.disk?.percent || 0, color: 'orange' }]} label={<IconDatabase size={24} />} />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
      
      <Card shadow="sm" p="lg" radius="md">
        <Title order={4} mb="md">Network Statistics</Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Metric</Table.Th>
              <Table.Th>Value</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Bytes Sent</Table.Td>
              <Table.Td>{systemStats?.network?.bytes_sent || 0} bytes</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Bytes Received</Table.Td>
              <Table.Td>{systemStats?.network?.bytes_recv || 0} bytes</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Packets Sent</Table.Td>
              <Table.Td>{systemStats?.network?.packets_sent || 0}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Packets Received</Table.Td>
              <Table.Td>{systemStats?.network?.packets_recv || 0}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Card>
    </Container>
  )
}
