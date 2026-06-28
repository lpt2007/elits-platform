import { Box, Group, Text, Divider } from '@mantine/core'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  IconHome2,
  IconSettings,
  IconBell,
  IconUser,
} from '@tabler/icons-react'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavigate = (path) => {
    navigate(path)
  }

  const MenuItem = ({ icon: Icon, label, path, active }) => (
    <Group
      onClick={() => handleNavigate(path)}
      style={({ colors }) => ({
        padding: '12px 16px',
        cursor: 'pointer',
        backgroundColor: active ? colors.dark[5] : 'transparent',
        borderRadius: '8px',
        margin: '4px 8px',
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: active ? colors.dark[5] : colors.dark[6],
        },
      })}
      justify="flex-start"
    >
      <Icon size={20} color={active ? '#228be6' : 'white'} />
      <Text c={active ? 'blue' : 'white'}>{label}</Text>
    </Group>
  )

  return (
    <Box
      style={({ colors }) => ({
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 200,
        backgroundColor: colors.dark[7],
        borderRight: `1px solid ${colors.dark[4]}`,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      {/* GORNJI DEL - Dashboard */}
      <Box>
        <Box p="md">
          <Text fw={700} c="white" size="lg">Elits Platform</Text>
        </Box>
        
        <MenuItem
          icon={IconHome2}
          label="Dashboard"
          path="/"
          active={location.pathname === '/'}
        />
      </Box>

      {/* SREDINA - prazen prostor z flex */}
      <div style={{ flex: 1 }} />

      {/* SPODNJI DEL - Settings, Notifications, User */}
      <Box>
        <Divider my="sm" />
        
        <MenuItem
          icon={IconSettings}
          label="Settings"
          path="/settings"
          active={location.pathname.startsWith('/settings')}
        />

        <MenuItem
          icon={IconBell}
          label="Notifications"
          path="/notifications"
          active={location.pathname === '/notifications'}
        />

        <MenuItem
          icon={IconUser}
          label="admin"
          path="/profile"
          active={location.pathname === '/profile'}
        />
      </Box>
    </Box>
  )
}
