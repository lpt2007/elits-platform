import { MantineProvider } from '@mantine/core'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import { getRegisteredPages } from './pages/registry/registry'
import './pages/registry/index.jsx'  // Inicializiraj registry

export default function App() {
  const registeredPages = getRegisteredPages()

  return (
    <MantineProvider defaultColorScheme="dark">
      <Router>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <div style={{ flex: 1, marginLeft: 200 }}>
            <Routes>
              {registeredPages.map(page => {
                const Component = page.component
                return (
                  <Route
                    key={page.path}
                    path={page.path}
                    element={<Component />}
                    exact={page.exact}
                  />
                )
              })}
              
              {/* Notifications in Profile */}
              <Route path="/notifications" element={<div style={{padding: 40, color: 'white'}}>Notifications</div>} />
              <Route path="/profile" element={<div style={{padding: 40, color: 'white'}}>User Profile</div>} />
            </Routes>
          </div>
        </div>
      </Router>
    </MantineProvider>
  )
}
