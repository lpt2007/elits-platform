import { Card, Text } from '@mantine/core'

export default function DocumentationTab({ addon }) {
  const manifest = addon.manifest || addon

  return (
    <Card shadow="sm" p="lg" radius="md">
      <Text>Documentation for {manifest.name} will appear here.</Text>
    </Card>
  )
}
