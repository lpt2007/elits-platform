import { Card, Title, Text, TextInput, Button, Box } from '@mantine/core'

export default function NetworkTab({ addon }) {
  const manifest = addon.manifest || addon

  return (
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
  )
}
