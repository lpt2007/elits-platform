import { Card, Title, Switch, TextInput, Button } from '@mantine/core'

export default function ConfigurationTab({ addon }) {
  const manifest = addon.manifest || addon

  return (
    <Card shadow="sm" p="lg" radius="md">
      <Title order={4} mb="md">Options</Title>
      <Switch label="Start on boot" defaultChecked mb="md" />
      <Switch label="Watchdog" mb="md" />
      <Switch label="Auto update" mb="md" />
      <TextInput label="Hostname" defaultValue={manifest.slug} mb="md" />
    </Card>
  )
}
