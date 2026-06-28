import { createContext, useContext, useState } from 'react'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    id: 'admin',
    name: 'Administrator',
    role: 'admin',
    permissions: ['view_dashboard', 'edit_dashboard', 'manage_users']
  })

  const canViewDashboard = (dashboardId) => {
    if (user.role === 'admin') return true
    return user.permissions.includes(`view_dashboard_${dashboardId}`)
  }

  const canEditDashboard = (dashboardId) => {
    if (user.role === 'admin') return true
    return user.permissions.includes(`edit_dashboard_${dashboardId}`)
  }

  return (
    <UserContext.Provider value={{ user, setUser, canViewDashboard, canEditDashboard }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
