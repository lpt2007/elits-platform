import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Box, Group } from '@mantine/core'
import Sidebar from '../Sidebar/Sidebar'

const routeTitles = {
  '/': 'Dashboard',
  '/settings': 'Settings',
  '/settings/apps': 'Apps',
  '/settings/apps/store': 'App Store',
  '/settings/system': 'System',
  '/settings/system/home': 'Elits Platform Info',
  '/settings/system/updates': 'Updates',
  '/settings/system/repairs': 'Repairs',
  '/settings/system/logs': 'Logs',
  '/settings/system/backups': 'Backups',
  '/settings/system/storage': 'Storage',
  '/settings/system/hardware': 'Hardware',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const getTitle = () => {
    const path = location.pathname
    if (path.startsWith('/settings/apps/') && path !== '/settings/apps/store') {
      return 'Addon Details'
    }
    return routeTitles[path] || 'Elits Platform'
  }

  // Določi katero sekcijo prikazujemo
  const currentSection = location.pathname.startsWith('/settings') ? 'settings' : 'dashboard'

  return (
    <Group gap={0} style={{ minHeight: '100vh' }}>
      <Sidebar 
        open={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentSection={currentSection}
        onNavigate={navigate}
      />
      <Box
        style={({ colors }) => ({
          flex: 1,
          backgroundColor: colors.dark[8],
          marginLeft: sidebarOpen ? 200 : 60,
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
        })}
      >
        <Outlet />
      </Box>
    </Group>
  )
}
