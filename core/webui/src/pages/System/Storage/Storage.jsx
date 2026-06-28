import { Container, Title, Card, Text, Group, Progress, Button, Modal, TextInput, Radio, Stack, Box, ActionIcon, Loader } from '@mantine/core'
import { IconArrowLeft, IconDatabase, IconSettings } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function Storage() {
  const navigate = useNavigate()
  const [opened, { open, close }] = useDisclosure(false)
  
  const { data: systemStats, isLoading } = useQuery({
    queryKey: ['system-stats'],
    queryFn: () => axios.get('/observer/system').then(res => res.data),
    refetchInterval: 10000,
  })

  if (isLoading) {
    return (
      <Container size="md" py="xl" px="xl">
        <Group mb="xl">
          <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings/system')}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={2}>Storage</Title>
        </Group>
        <Group justify="center" py="xl">
          <Loader size="xl" />
        </Group>
      </Container>
    )
  }

  const toGB = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(1)
  const totalGB = parseFloat(toGB(systemStats?.disk?.total || 0))
  const usedGB = parseFloat(toGB(systemStats?.disk?.used || 0))
  const freeGB = parseFloat(toGB(systemStats?.disk?.free || 0))
  
  const breakdown = [
    { label: 'System', value: (totalGB * 0.3).toFixed(1), color: 'blue' },
    { label: 'App data', value: (totalGB * 0.2).toFixed(1), color: 'yellow' },
    { label: 'Backups', value: (totalGB * 0.15).toFixed(1), color: 'pink' },
    { label: 'Elits Platform', value: (totalGB * 0.05).toFixed(1), color: 'cyan' },
  ]

  return (
    <Container size="md" py="xl" px="xl">
      <Group mb="xl">
        <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings/system')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>Storage</Title>
      </Group>
      
      <Card shadow="sm" p="md" mb="md" radius="md">
        <Group justify="space-between" mb="sm">
          <Title order={4}>Disk metrics</Title>
          <ActionIcon variant="transparent" size="sm">
            <IconSettings size={16} opacity={0.5} />
          </ActionIcon>
        </Group>
        
        <Text size="sm" mb="xs">
          Storage: {usedGB} GB of {totalGB} GB used
        </Text>
        
        <Progress.Root size="sm" mb="xs">
          {breakdown.map((item) => (
            <Progress.Section
              key={item.label}
              value={(parseFloat(item.value) / totalGB) * 100}
              color={item.color}
            />
          ))}
          <Progress.Section value={(freeGB / totalGB) * 100} color="gray" />
        </Progress.Root>
        
        <Group gap="xs" mb="xs" style={{ flexWrap: 'wrap' }}>
          {breakdown.map((item) => (
            <Group key={item.label} gap="xs">
              <Box style={{ width: 8, height: 8, backgroundColor: item.color, borderRadius: '50%' }} />
              <Text size="xs">{item.label} {item.value} GB</Text>
            </Group>
          ))}
          <Group gap="xs">
            <Box style={{ width: 8, height: 8, backgroundColor: '#868e96', borderRadius: '50%' }} />
            <Text size="xs">Free space {freeGB} GB</Text>
          </Group>
        </Group>
        
        <Group justify="flex-end">
          <Button variant="transparent" size="compact-sm" c="blue">Move data disk</Button>
        </Group>
      </Card>
      
      <Card shadow="sm" p="md" radius="md">
        <Title order={4} mb="md">Network storage</Title>
        <Group justify="center" py="xl">
          <IconDatabase size={40} opacity={0.3} />
        </Group>
        <Text ta="center" c="dimmed" size="sm" mb="md">No connected network storage</Text>
        <Group justify="flex-end">
          <Button variant="transparent" size="compact-sm" c="blue" onClick={open}>Add network storage</Button>
        </Group>
      </Card>
      
      <Modal opened={opened} onClose={close} title="Add network storage" size="lg">
        <Stack gap="md">
          <TextInput label="Name*" placeholder="My Network Storage" required />
          <div>
            <Text fw={500} mb="xs">Usage</Text>
            <Radio.Group>
              <Radio value="backup" label="Backup" mb="xs" />
              <Radio value="media" label="Media" mb="xs" />
              <Radio value="share" label="Share" />
            </Radio.Group>
          </div>
          <TextInput label="Server*" placeholder="192.168.1.100" required />
          <div>
            <Text fw={500} mb="xs">Protocol</Text>
            <Radio.Group>
              <Radio value="cifs" label="Samba/Windows (CIFS)" mb="xs" />
              <Radio value="nfs" label="Network File System (NFS)" />
            </Radio.Group>
          </div>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>Cancel</Button>
            <Button onClick={close}>Connect</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
