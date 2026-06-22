import { Container, Title, Card, Text, Group, Box, Badge, Button, ActionIcon } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import {
  IconHome,
  IconRefresh,
  IconBug,
  IconFileText,
  IconDatabase,
  IconChartBar,
  IconBrain,
  IconFlask,
  IconNetwork,
  IconServer,
  IconCpu,
  IconChevronRight,
  IconHammer,
  IconArrowLeft,
} from '@tabler/icons-react'

function SystemCard({ icon: Icon, title, description, path, color, underConstruction = false }) {
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

function SystemSection({ children }) {
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
      {children}
    </Card>
  )
}

export default function System() {
  const navigate = useNavigate()
  
  return (
    <Container size="md" py="xl" px="xl">
      <Group mb="xl">
        <ActionIcon 
          variant="transparent" 
          size="lg"
          onClick={() => navigate('/settings')}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>System</Title>
      </Group>
      
      <SystemSection>
        <SystemCard
          icon={IconHome}
          title="Home information"
          description="Name, location, and regional settings"
          path="/settings/system/home"
          color="#d6336c"
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SystemCard
          icon={IconRefresh}
          title="Updates"
          description="Manage updates of Elits Platform, apps, and devices"
          path="/settings/system/updates"
          color="#228be6"
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SystemCard
          icon={IconBug}
          title="Repairs"
          description="Find and fix issues with your Elits Platform instance"
          path="/settings/system/repairs"
          color="#40c057"
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SystemCard
          icon={IconFileText}
          title="Logs"
          description="View and search logs to diagnose issues"
          path="/settings/system/logs"
          color="#fd7e14"
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SystemCard
          icon={IconDatabase}
          title="Backups"
          description="Create and restore backups"
          path="/settings/system/backups"
          color="#228be6"
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SystemCard
          icon={IconChartBar}
          title="Analytics"
          description="Learn how to share data to improve Elits Platform"
          path="/settings/system/analytics"
          color="#fcc419"
          underConstruction={true}
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SystemCard
          icon={IconBrain}
          title="AI tasks"
          description="Configure AI suggestions and task preferences"
          path="/settings/system/ai-tasks"
          color="#845ef7"
          underConstruction={true}
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SystemCard
          icon={IconFlask}
          title="Labs"
          description="Preview new features"
          path="/settings/system/labs"
          color="#94d82d"
          underConstruction={true}
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SystemCard
          icon={IconNetwork}
          title="Network"
          description="External access configuration"
          path="/settings/system/network"
          color="#d6336c"
          underConstruction={true}
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SystemCard
          icon={IconServer}
          title="Storage"
          description="Manage storage and disk usage"
          path="/settings/system/storage"
          color="#40c057"
        />
        <Box style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 64 }} />
        <SystemCard
          icon={IconCpu}
          title="Hardware"
          description="Configure your hub and connected hardware"
          path="/settings/system/hardware"
          color="#845ef7"
        />
      </SystemSection>
    </Container>
  )
}
