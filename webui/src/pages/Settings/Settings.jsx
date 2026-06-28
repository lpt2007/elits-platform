import { Container, Title, Card, Text, Group, Box, Badge, ActionIcon } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import {
  IconApps,
  IconLayoutDashboard,
  IconUsers,
  IconSettings,
  IconTool,
  IconInfoCircle,
  IconChevronRight,
  IconHammer,
  IconArrowLeft,
} from '@tabler/icons-react'

function SettingsCard({ icon: Icon, title, description, path, color, underConstruction = false }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (underConstruction) {
      notifications.show({
        title: 'Under Construction',
        message: `${title} is coming soon`,
        color: 'yellow',
        icon: <IconHammer size={18} />,
      })
    } else {
      navigate(path)
    }
  }

  return (
    <Box
      onClick={handleClick}
      style={({ colors }) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        gap: '16px',
        cursor: underConstruction ? 'not-allowed' : 'pointer',
        opacity: underConstruction ? 0.7 : 1,
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: underConstruction ? 'transparent' : colors.dark[6],
        },
      })}
    >
      <Icon size={28} color={color} />
      <div style={{ flex: 1 }}>
        <Group gap="xs">
          <Text fw={500}>{title}</Text>
          {underConstruction && (
            <Badge size="xs" color="yellow" variant="light">
              Under Construction
            </Badge>
          )}
        </Group>
        <Text size="sm" c="dimmed">{description}</Text>
      </div>
      <IconChevronRight size={20} opacity={0.5} />
    </Box>
  )
}

function SettingsSection({ title, children }) {
  return (
    <Card
      shadow="sm"
      p={0}
      mb="lg"
      radius="md"
      style={({ colors }) => ({
        backgroundColor: colors.dark[7],
        overflow: 'hidden',
      })}
    >
      {title && (
        <Box style={{ padding: '12px 16px', borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <Text size="sm" fw={500} c="dimmed">{title}</Text>
        </Box>
      )}
      {children}
    </Card>
  )
}

export default function Settings() {
  const navigate = useNavigate()

  return (
    <Container size="md" py="xl" px="xl">
      <Group mb="xl">
        <ActionIcon
          variant="transparent"
          size="lg"
          onClick={() => navigate('/')}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>Settings</Title>
      </Group>

      <SettingsSection>
        <SettingsCard
          icon={IconApps}
          title="Apps"
          description="Run extra applications next to Elits Platform"
          path="/settings/apps"
          color="#f59f00"
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SettingsCard
          icon={IconLayoutDashboard}
          title="Dashboards"
          description="Organize how you interact with your platform"
          path="/settings/dashboards"
          color="#e64980"
          underConstruction={true}
        />
      </SettingsSection>

      <SettingsSection>
        <SettingsCard
          icon={IconUsers}
          title="Users"
          description="Manage who can access your home"
          path="/settings/users"
          color="#228be6"
          underConstruction={true}
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SettingsCard
          icon={IconSettings}
          title="System"
          description="Create backups, check logs, or reboot your system"
          path="/settings/system"
          color="#7950f2"
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SettingsCard
          icon={IconTool}
          title="Developer tools"
          description="Advanced tools for inspecting and debugging"
          path="/settings/developer"
          color="#9775fa"
          underConstruction={true}
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SettingsCard
          icon={IconInfoCircle}
          title="About"
          description="Version information, credit, and more"
          path="/settings/about"
          color="#868e96"
          underConstruction={true}
        />
      </SettingsSection>
    </Container>
  )
}
