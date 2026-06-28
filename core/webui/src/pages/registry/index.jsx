import { getRegisteredPages, registerPage } from './registry'

import Dashboard from '../Dashboard/Dashboard'
import Settings from '../Settings/Settings'
import Apps from '../Apps/Apps'
import AppStore from '../AppStore/AppStore'
import AddonDetails from '../AddonDetails/AddonDetails'
import System from '../System/System'
import HomeInfo from '../System/HomeInfo/HomeInfo'
import Updates from '../System/Updates/Updates'
import Repairs from '../System/Repairs/Repairs'
import Logs from '../System/Logs/Logs'
import Backups from '../System/Backups/Backups'
import Storage from '../System/Storage/Storage'
import Hardware from '../System/Hardware/Hardware'
import Dashboards from '../Dashboards/Dashboards'
import Users from '../Users/Users'
import DeveloperTools from '../DeveloperTools/DeveloperTools'
import About from '../About/About'

// Dashboard
registerPage({ path: '/', name: 'Dashboard', component: Dashboard, order: 10, exact: true })

// Settings - GLAVNI MENU
registerPage({ path: '/settings', name: 'Settings', component: Settings, order: 20 })

// Settings/Apps
registerPage({ path: '/settings/apps', name: 'Apps', component: Apps, order: 21 })
registerPage({ path: '/settings/apps/store', name: 'App Store', component: AppStore, order: 22 })
registerPage({ path: '/settings/apps/:slug', name: 'Addon Details', component: AddonDetails, order: 23 })

// Settings/System
registerPage({ path: '/settings/system', name: 'System', component: System, order: 30 })
registerPage({ path: '/settings/system/home', name: 'Elits Platform Info', component: HomeInfo, order: 31 })
registerPage({ path: '/settings/system/updates', name: 'Updates', component: Updates, order: 32 })
registerPage({ path: '/settings/system/repairs', name: 'Repairs', component: Repairs, order: 33 })
registerPage({ path: '/settings/system/logs', name: 'Logs', component: Logs, order: 34 })
registerPage({ path: '/settings/system/backups', name: 'Backups', component: Backups, order: 35 })
registerPage({ path: '/settings/system/storage', name: 'Storage', component: Storage, order: 36 })
registerPage({ path: '/settings/system/hardware', name: 'Hardware', component: Hardware, order: 37 })

// Settings/Other
registerPage({ path: '/settings/dashboards', name: 'Dashboards', component: Dashboards, order: 40 })
registerPage({ path: '/settings/users', name: 'Users', component: Users, order: 41 })
registerPage({ path: '/settings/developer', name: 'Developer Tools', component: DeveloperTools, order: 42 })
registerPage({ path: '/settings/about', name: 'About', component: About, order: 43 })

export { getRegisteredPages, registerPage }
