import { Card, Group, ActionIcon } from '@mantine/core'
import { IconDotsVertical } from '@tabler/icons-react'

export default function BaseCard({ children, title, icon, onEdit, config }) {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      {title && (
        <Group justify="space-between" mb="md">
          <Group>
            {icon}
            <Text fw={600}>{title}</Text>
          </Group>
          {onEdit && (
            <ActionIcon variant="transparent" onClick={onEdit}>
              <IconDotsVertical size={18} />
            </ActionIcon>
          )}
        </Group>
      )}
      {children}
    </Card>
  )
}
