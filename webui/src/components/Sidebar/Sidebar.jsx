import { Box, Group, Text, ActionIcon, Tooltip } from '@mantine/core'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  IconHome2,
  IconSettings,
  IconMenu2,
  IconX,
} from '@tabler/icons-react'

export default function Sidebar({ open, onToggle }) {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { icon: IconHome2, label: 'Dashboard', path: '/' },
    { icon: IconSettings, label: 'Settings', path: '/settings' },
  ]

  return (
    <Box
      style={({ colors }) => ({
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: open ? 200 : 60,
        backgroundColor: colors.dark[7],
        borderRight: `1px solid ${colors.dark[4]}`,
        transition: 'width 0.3s ease',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Group justify="space-between" p="md">
        {open && <Text fw={700} c="white">Elits Platform</Text>}
        <ActionIcon variant="transparent" onClick={onToggle} c="white">
          {open ? <IconX size={20} /> : <IconMenu2 size={20} />}
        </ActionIcon>
      </Group>

      <Box style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          const content = (
            <Group
              key={item.path}
              onClick={() => navigate(item.path)}
              style={({ colors }) => ({
                padding: open ? '12px 16px' : '12px',
                cursor: 'pointer',
                backgroundColor: isActive ? colors.dark[5] : 'transparent',
                borderRadius: '8px',
                margin: open ? '4px 8px' : '4px',
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: isActive ? colors.dark[5] : colors.dark[6],
                },
              })}
              justify={open ? 'flex-start' : 'center'}
            >
              <Icon size={20} color={isActive ? '#228be6' : 'white'} />
              {open && <Text c={isActive ? 'blue' : 'white'}>{item.label}</Text>}
            </Group>
          )

          return open ? content : (
            <Tooltip key={item.path} label={item.label} position="right">
              {content}
            </Tooltip>
          )
        })}
      </Box>
    </Box>
  )
}
