import { useEffect, useRef } from 'react'
import { Card } from '@mantine/core'

export default function HACustomCard({ type, config }) {
  const cardRef = useRef(null)

  useEffect(() => {
    // Poskusi naložiti HA custom element
    const loadHACard = async () => {
      try {
        // Preveri če custom element že obstaja
        if (!customElements.get(type)) {
          // Poskusi naložiti iz HA ali CDN
          const response = await fetch(`/api/ha-lovelace/load-card/${type}`)
          if (response.ok) {
            const script = await response.text()
            eval(script)
          }
        }

        // Ustvari custom element
        if (customElements.get(type) && cardRef.current) {
          const element = document.createElement(type)
          element.setConfig(config)
          cardRef.current.innerHTML = ''
          cardRef.current.appendChild(element)
        }
      } catch (error) {
        console.error(`Failed to load HA card ${type}:`, error)
      }
    }

    loadHACard()
  }, [type, config])

  return (
    <Card shadow="sm" p="lg" radius="md">
      <div ref={cardRef} />
    </Card>
  )
}
