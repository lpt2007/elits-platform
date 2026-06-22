import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import Settings from './pages/Settings/Settings'
import System from './pages/System/System'
import Apps from './pages/Apps/Apps'
import AppStore from './pages/AppStore/AppStore'
import AddonDetails from './pages/AddonDetails/AddonDetails'
import HomeInfo from './pages/System/HomeInfo/HomeInfo'
import Updates from './pages/System/Updates/Updates'
import Repairs from './pages/System/Repairs/Repairs'
import Logs from './pages/System/Logs/Logs'
import Backups from './pages/System/Backups/Backups'
import Storage from './pages/System/Storage/Storage'
import Hardware from './pages/System/Hardware/Hardware'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/apps" element={<Apps />} />
          <Route path="settings/apps/store" element={<AppStore />} />
          <Route path="settings/apps/:slug" element={<AddonDetails />} />
          <Route path="settings/system" element={<System />} />
          <Route path="settings/system/home" element={<HomeInfo />} />
          <Route path="settings/system/updates" element={<Updates />} />
          <Route path="settings/system/repairs" element={<Repairs />} />
          <Route path="settings/system/logs" element={<Logs />} />
          <Route path="settings/system/backups" element={<Backups />} />
          <Route path="settings/system/storage" element={<Storage />} />
          <Route path="settings/system/hardware" element={<Hardware />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
