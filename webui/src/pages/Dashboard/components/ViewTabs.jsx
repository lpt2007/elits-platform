import { Tabs, ActionIcon, Menu } from '@mantine/core'
import { IconDots } from '@tabler/icons-react'

export default function ViewTabs({ views, activeView, onChange, onAdd, onRename, onDelete }) {
  return (
    <Tabs value={activeView} onChange={onChange} mb="xl">
      <Tabs.List>
        {views.map((view, index) => (
          <Tabs.Tab 
            key={view.id} 
            value={index}
            rightSection={
              <Menu withinPortal position="bottom-end" shadow="sm">
                <Menu.Target>
                  <ActionIcon 
                    variant="transparent" 
                    size="xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconDots size={14} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item 
                    onClick={(e) => {
                      e.stopPropagation()
                      const newTitle = prompt('View name:', view.title)
                      if (newTitle) onRename(index, newTitle)
                    }}
                  >
                    Rename
                  </Menu.Item>
                  <Menu.Item 
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(index)
                    }}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            }
          >
            {view.title || `View ${index + 1}`}
          </Tabs.Tab>
        ))}
        <Tabs.Tab onClick={onAdd}>+ Add View</Tabs.Tab>
      </Tabs.List>
    </Tabs>
  )
}
