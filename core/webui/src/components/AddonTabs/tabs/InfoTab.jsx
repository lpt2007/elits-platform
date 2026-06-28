import { Card, Text } from '@mantine/core'

export default function InfoTab({ addon }) {
  const manifest = addon.manifest || addon

  return (
    <Card shadow="sm" p="lg" radius="md">
      <Text>{manifest.description || 'No description available'}</Text>
      {manifest.version && <Text size="sm" c="dimmed" mt="md">Version: {manifest.version}</Text>}
      {manifest.url && <Text size="sm" c="dimmed">URL: <a href={manifest.url} target="_blank" rel="noopener noreferrer">{manifest.url}</a></Text>}
      {manifest.category && <Text size="sm" c="dimmed">Category: {manifest.category}</Text>}
      {manifest.stage && <Text size="sm" c="dimmed">Stage: {manifest.stage}</Text>}
    </Card>
  )
}
