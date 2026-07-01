import { Container, Title, Table, Button, Group, Badge, ActionIcon, Text, Card, Stack, Modal, Select } from '@mantine/core'
import { IconArrowLeft, IconTrash, IconRestore, IconPlus } from '@tabler/icons-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'

export default function Backups() {
  const navigate = useNavigate()
  const [opened, setOpened] = useState(false)
  const [selectedAddon, setSelectedAddon] = useState(null)

  const { data: addons } = useQuery({
    queryKey: ['addons'],
    queryFn: () => axios.get('/api/addons').then(res => res.data),
  })

  const { data: backups, refetch } = useQuery({
    queryKey: ['backups'],
    queryFn: () => axios.get('/api/backups').then(res => res.data),
  })

  const backupMutation = useMutation({
    mutationFn: (slug) => axios.post(`/api/backup/addon/${slug}`),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Backup created successfully', color: 'green' })
      setOpened(false)
      setSelectedAddon(null)
      refetch()
    },
    onError: (error) => {
      notifications.show({ title: 'Error', message: error.response?.data?.detail || 'Failed to create backup', color: 'red' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ slug, timestamp }) => axios.delete(`/api/backup/${slug}/${timestamp}`),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Backup deleted', color: 'green' })
      refetch()
    },
    onError: (error) => {
      notifications.show({ title: 'Error', message: error.response?.data?.detail || 'Failed to delete', color: 'red' })
    },
  })

  const restoreMutation = useMutation({
    mutationFn: ({ slug, timestamp }) => axios.post(`/api/restore/addon/${slug}?backup_timestamp=${timestamp}`),
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Addon restored successfully', color: 'green' })
      refetch()
    },
    onError: (error) => {
      notifications.show({ title: 'Error', message: error.response?.data?.detail || 'Failed to restore', color: 'red' })
    },
  })

  // Pripravi seznam addonov za select
  const addonOptions = addons?.map(addon => ({
    value: addon.slug,
    label: `${addon.name} (${addon.state === 'running' ? 'Running' : 'Stopped'})`,
  })).filter(addon => addon.label.includes('Running')) || []

  const handleCreateBackup = () => {
    console.log('handleCreateBackup called', { selectedAddon })
    if (selectedAddon) {
      console.log('Starting backup for:', selectedAddon)
      backupMutation.mutate(selectedAddon)
    } else {
      notifications.show({ title: 'Error', message: 'Please select an addon', color: 'red' })
    }
  }

  return (
    <Container size="xl" py="xl" px="xl">
      <Group mb="lg">
        <ActionIcon variant="transparent" size="lg" onClick={() => navigate('/settings/system')}>
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>Backups</Title>
      </Group>

      <Group mb="lg">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            console.log('Create Backup button clicked')
            setOpened(true)
          }}
        >
          Create Backup
        </Button>
      </Group>

      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Stack>
          <Title order={4}>Backup History</Title>
          
          {backups?.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">No backups yet</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Addon</Table.Th>
                  <Table.Th>Timestamp</Table.Th>
                  <Table.Th>Size</Table.Th>
                  <Table.Th>Image</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {backups?.map((backup) => (
                  <Table.Tr key={`${backup.slug}-${backup.timestamp}`}>
                    <Table.Td>
                      <Badge color="blue" size="sm">{backup.slug}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{backup.timestamp.replace('_', ' ')}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{backup.size_mb.toFixed(2)} MB</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">{backup.image}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          leftSection={<IconRestore size={16} />}
                          size="xs"
                          color="green"
                          onClick={() => {
                            if (window.confirm(`Restore ${backup.slug} from ${backup.timestamp}?`)) {
                              restoreMutation.mutate({ slug: backup.slug, timestamp: backup.timestamp })
                            }
                          }}
                          loading={restoreMutation.isPending}
                        >
                          Restore
                        </Button>
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => {
                            if (window.confirm(`Delete backup ${backup.slug} from ${backup.timestamp}?`)) {
                              deleteMutation.mutate({ slug: backup.slug, timestamp: backup.timestamp })
                            }
                          }}
                          loading={deleteMutation.isPending}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Card>

      <Modal
        opened={opened}
        onClose={() => {
          console.log('Modal closed')
          setOpened(false)
          setSelectedAddon(null)
        }}
        title="Create Backup"
      >
        <Stack>
          <Text>Select an addon to backup:</Text>
          <Select
            data={addonOptions}
            value={selectedAddon}
            onChange={setSelectedAddon}
            placeholder="Choose addon..."
            searchable
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={() => {
                setOpened(false)
                setSelectedAddon(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBackup}
              loading={backupMutation.isPending}
            >
              Create Backup
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
