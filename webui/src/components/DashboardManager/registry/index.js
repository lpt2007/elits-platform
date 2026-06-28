/**
 * Registry za Dashboard-e
 */

const dashboards = []

export function registerDashboard(dashboardConfig) {
  if (dashboards.find(d => d.id === dashboardConfig.id)) {
    console.warn(`Dashboard with id "${dashboardConfig.id}" is already registered`)
    return
  }
  
  dashboards.push({
    order: 50,
    ...dashboardConfig
  })
  
  dashboards.sort((a, b) => a.order - b.order)
}

export function getRegisteredDashboards() {
  return dashboards
}

export function getDashboardById(id) {
  return dashboards.find(d => d.id === id)
}

// Uvozi in registriraj dashboard-e
import DefaultDashboard from '../dashboards/DefaultDashboard'

registerDashboard({
  id: 'default',
  name: 'Default Dashboard',
  description: 'System overview',
  component: DefaultDashboard,
  permissions: ['view_dashboard'],
  order: 10
})
