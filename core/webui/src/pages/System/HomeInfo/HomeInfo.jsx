import { Container, Title, Card, Text, TextInput, Select, Stack, Button, Group, ActionIcon, Loader, Grid } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function HomeInfo() {
  const navigate = useNavigate()
  
  const { data: hostInfo, isLoading } = useQuery({
    queryKey: ['host-info'],
    queryFn: () => axios.get('/observer/host/info').then(res => res.data),
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <Container size="md" py="xl" px="xl">
        <Group mb="xl">
          <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings/system')}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={2}>Elits Platform Info</Title>
        </Group>
        <Group justify="center" py="xl">
          <Loader size="xl" />
        </Group>
      </Container>
    )
  }

  return (
    <Container size="md" py="xl" px="xl">
      <Group mb="xl">
        <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings/system')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>Elits Platform Info</Title>
      </Group>
      
      <Card shadow="sm" p="lg" radius="md" mb="lg">
        <Title order={4} mb="md">System Information</Title>
        <Grid>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Hostname</Text>
            <Text fw={500}>{hostInfo?.hostname || 'Unknown'}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Operating System</Text>
            <Text fw={500}>{hostInfo?.operating_system || 'Unknown'}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Architecture</Text>
            <Text fw={500}>{hostInfo?.architecture || 'Unknown'}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Kernel</Text>
            <Text fw={500}>{hostInfo?.kernel || 'Unknown'}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Python Version</Text>
            <Text fw={500}>{hostInfo?.python_version || 'Unknown'}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Uptime</Text>
            <Text fw={500}>{hostInfo?.uptime || 'Unknown'}</Text>
          </Grid.Col>
        </Grid>
      </Card>
      
      <Card shadow="sm" p="lg" radius="md">
        <Title order={4} mb="md">Configuration</Title>
        <Stack>
          <TextInput label="Platform Name" placeholder="Elits Platform" defaultValue="Elits Platform" />
          <TextInput label="Location" placeholder="City, Country" defaultValue="Ljubljana, Slovenia" />
          <Select label="Timezone" placeholder="Select timezone" data={['Europe/Ljubljana', 'Europe/Berlin', 'UTC']} defaultValue="Europe/Ljubljana" />
          <Select label="Unit System" data={['Metric', 'US Customary']} defaultValue="Metric" />
          <Button mt="md" color="blue">Save</Button>
        </Stack>
      </Card>
    </Container>
  )
}
