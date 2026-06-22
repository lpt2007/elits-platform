import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Container, Title, Tabs, Card, Text, Group, Badge, Button, Switch, TextInput, Code, Alert, Loader, ActionIcon, Box } from '@mantine/core'
import { IconAlertCircle, IconArrowLeft, IconPlayerPlay, IconPlayerStop, IconRefresh, IconTrash, IconExternalLink, IconDownload } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'

export default function AddonDetails() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const { data: addon, isLoading, error, refetch } = useQuery({
    queryKey: ['addon', slug],
    queryFn: () => axios.get(`/api/addons/${slug}`).then(res => res.data),
    retry: false,
  })

  const { data: logs } = useQuery({
    queryKey: ['addon-logs', slug],
    queryFn: () => axios.get(`/api/addons/${slug}/logs`).then(res => res.data),
    refetchInterval: 5000,
    enabled: !!addon,
  })

  const ingressUrl = addon?.state === 'running' ? `/app/${slug}/` : null

  const startMutation = useMutation({
    mutationFn: () => axios.post(`/api/addons/${slug}/start`),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Addon started successfully', color: 'green', autoClose: 3000 })
      refetch()
    },
    onError: (error) => {
      notifications.show({ title: 'Error', message: error.response?.data?.detail || 'Failed to start addon', color: 'red', autoClose: 5000 })
    }
  })

  const stopMutation = useMutation({
    mutationFn: () => axios.post(`/api/addons/${slug}/stop`),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Addon stopped successfully', color: 'green', autoClose: 3000 })
      refetch()
    },
    onError: (error) => {
      notifications.show({ title: 'Error', message: error.response?.data?.detail || 'Failed to stop addon', color: 'red', autoClose: 5000 })
    }
  })

  const restartMutation = useMutation({
    mutationFn: () => axios.post(`/api/addons/${slug}/restart`),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Addon restarted successfully', color: 'green', autoClose: 3000 })
      refetch()
    },
    onError: (error) => {
      notifications.show({ title: 'Error', message: error.response?.data?.detail || 'Failed to restart addon', color: 'red', autoClose: 5000 })
    }
  })

  const uninstallMutation = useMutation({
    mutationFn: () => axios.post(`/api/addons/${slug}/uninstall`),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Addon uninstalled successfully', color: 'green', autoClose: 3000 })
      navigate('/settings/apps')
    },
    onError: (error) => {
      notifications.show({ title: 'Error', message: error.response?.data?.detail || 'Failed to uninstall addon', color: 'red', autoClose: 5000 })
    }
  })

  if (isLoading) {
    return (
      <Container size="xl" py="xl" style={{ textAlign: 'center' }}>
        <Loader size="xl" />
        <Text mt="md">Loading...</Text>
      </Container>
    )
  }

  if (error || !addon || addon.detail === 'Addon not found') {
    return (
      <Container size="xl" py="xl" px="xl">
        <Group mb="xl">
          <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings/apps')}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={2}>{slug}</Title>
        </Group>
        <Alert icon={<IconAlertCircle size={16} />} title="Addon not found" color="red">
          This addon is not installed. You can install it from the App Store.
        </Alert>
        <Button mt="md" leftSection={<IconDownload size={16} />} onClick={() => navigate(`/settings/apps/store`)}>
          Go to App Store
        </Button>
      </Container>
    )
  }

  const manifest = addon.manifest || addon

  return (
    <Container size="xl" py="xl" px="xl">
      <Group mb="xl">
        <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings/apps')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>{manifest.name || slug}</Title>
        <Badge color={addon.state === 'running' ? 'green' : 'gray'}>{addon.state}</Badge>
      </Group>

      <Card shadow="sm" p="md" mb="lg" radius="md">
        <Group justify="space-between">
          <Group>
            {addon.state === 'running' ? (
              <>
                <Button color="yellow" leftSection={<IconPlayerStop size={16} />} onClick={() => stopMutation.mutate()} loading={stopMutation.isPending}>Stop</Button>
                <Button color="blue" leftSection={<IconRefresh size={16} />} onClick={() => restartMutation.mutate()} loading={restartMutation.isPending}>Restart</Button>
                {ingressUrl && (
                  <Button color="green" leftSection={<IconExternalLink size={16} />} component="a" href={ingressUrl} target="_blank">Open Web UI</Button>
                )}
              </>
            ) : (
              <Button color="green" leftSection={<IconPlayerPlay size={16} />} onClick={() => startMutation.mutate()} loading={startMutation.isPending}>Start</Button>
            )}
          </Group>
          
          <Button 
            color="red" 
            variant="light"
            leftSection={<IconTrash size={16} />} 
            onClick={() => {
              if (window.confirm('Are you sure you want to uninstall this addon?')) {
                uninstallMutation.mutate()
              }
            }}
            loading={uninstallMutation.isPending}
          >
            Uninstall
          </Button>
        </Group>
      </Card>

      <Tabs defaultValue="info">
        <Tabs.List>
          <Tabs.Tab value="info">Info</Tabs.Tab>
          <Tabs.Tab value="documentation">Documentation</Tabs.Tab>
          <Tabs.Tab value="configuration">Configuration</Tabs.Tab>
          <Tabs.Tab value="network">Network</Tabs.Tab>
          <Tabs.Tab value="log">Log</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="info" pt="md">
          <Card shadow="sm" p="lg" radius="md">
            <Text>{manifest.description || 'No description available'}</Text>
            {manifest.version && <Text size="sm" c="dimmed" mt="md">Version: {manifest.version}</Text>}
            {manifest.url && <Text size="sm" c="dimmed">URL: <a href={manifest.url} target="_blank" rel="noopener noreferrer">{manifest.url}</a></Text>}
            {manifest.category && <Text size="sm" c="dimmed">Category: {manifest.category}</Text>}
            {manifest.stage && <Text size="sm" c="dimmed">Stage: {manifest.stage}</Text>}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="documentation" pt="md">
          <Card shadow="sm" p="lg" radius="md">
            <Text>Documentation for {manifest.name} will appear here.</Text>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="configuration" pt="md">
          <Card shadow="sm" p="lg" radius="md">
            <Title order={4} mb="md">Options</Title>
            <Switch label="Start on boot" defaultChecked mb="md" />
            <Switch label="Watchdog" mb="md" />
            <Switch label="Auto update" mb="md" />
            <TextInput label="Hostname" defaultValue={manifest.slug} mb="md" />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="network" pt="md">
          <Card shadow="sm" p="lg" radius="md">
            <Title order={4} mb="md">Network</Title>
            <Text c="dimmed" mb="md">Configure the network ports that this app uses.</Text>
            
            {manifest.ports && Object.entries(manifest.ports).map(([containerPort, hostPort]) => (
              <Box key={containerPort} mb="md">
                <TextInput
                  label={`${containerPort} → ${hostPort}`}
                  placeholder={`${containerPort}`}
                  defaultValue={String(hostPort)}
                  rightSection={<Text size="xs" c="dimmed">{containerPort}</Text>}
                  description={`Port mapping for ${containerPort}`}
                />
              </Box>
            ))}
            
            <Button color="red" variant="light" mt="md">Reset to defaults</Button>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="log" pt="md">
          <Card shadow="sm" p="lg" radius="md">
            <Title order={4} mb="md">Logs</Title>
            <Code block style={{ maxHeight: 400, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: '12px', backgroundColor: '#1a1b1e' }}>
              {logs?.logs?.join('\n') || 'No logs available'}
            </Code>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
