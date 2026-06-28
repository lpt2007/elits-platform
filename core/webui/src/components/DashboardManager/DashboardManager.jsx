import { useState } from 'react'
import { Container, Title, Tabs, Group, ActionIcon, Text } from '@mantine/core'
import { IconPlus, IconSettings } from '@tabler/icons-react'
import DefaultDashboard from './dashboards/DefaultDashboard'

export default function DashboardManager() {
  const [activeDashboard, setActiveDashboard] = useState('default')

  return (
    <Container size="xl" py="xl" px="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Dashboards</Title>
        <Group>
          <ActionIcon variant="light" size="lg">
            <IconPlus size={20} />
          </ActionIcon>
          <ActionIcon variant="light" size="lg">
            <IconSettings size={20} />
          </ActionIcon>
        </Group>
      </Group>

      <Tabs value={activeDashboard} onChange={setActiveDashboard}>
        <Tabs.List>
          <Tabs.Tab value="default">Default Dashboard</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="default" pt="xl">
          <DefaultDashboard />
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
