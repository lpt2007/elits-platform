import { Tabs } from '@mantine/core'
import { getRegisteredTabs } from './registry'

// Uvozi vse tab komponente
import InfoTab from './tabs/InfoTab'
import DocumentationTab from './tabs/DocumentationTab'
import ConfigurationTab from './tabs/ConfigurationTab'
import NetworkTab from './tabs/NetworkTab'
import LogTab from './tabs/LogTab'

// Registriraj vse tabe
import { registerTab } from './registry'

registerTab({
  id: 'info',
  label: 'Info',
  component: InfoTab,
  order: 10
})

registerTab({
  id: 'documentation',
  label: 'Documentation',
  component: DocumentationTab,
  order: 20
})

registerTab({
  id: 'configuration',
  label: 'Configuration',
  component: ConfigurationTab,
  order: 30
})

registerTab({
  id: 'network',
  label: 'Network',
  component: NetworkTab,
  order: 40
})

registerTab({
  id: 'log',
  label: 'Log',
  component: LogTab,
  order: 50
})

// Glavna komponenta
export default function AddonTabs({ addon }) {
  const tabs = getRegisteredTabs()

  if (tabs.length === 0) {
    return null
  }

  return (
    <Tabs defaultValue={tabs[0].id}>
      <Tabs.List>
        {tabs.map(tab => (
          <Tabs.Tab key={tab.id} value={tab.id}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs.map(tab => {
        const TabComponent = tab.component
        return (
          <Tabs.Panel key={tab.id} value={tab.id} pt="md">
            <TabComponent addon={addon} />
          </Tabs.Panel>
        )
      })}
    </Tabs>
  )
}
