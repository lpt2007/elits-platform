import { useState } from 'react'
import { Box } from '@mantine/core'

export default function Dashboard() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const haProxyUrl = 'http://192.168.200.201:8124'

  const handleIframeLoad = () => {
    setLoading(false)
  }

  const handleIframeError = () => {
    setError('Failed to load Home Assistant')
    setLoading(false)
  }

  return (
    <Box style={{
      position: 'absolute',
      top: 0,
      left: 200,
      right: 0,
      bottom: 0,
      backgroundColor: '#111'
    }}>
      {loading && (
        <Box style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          backgroundColor: 'rgba(0,0,0,0.9)',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
        </Box>
      )}

      {error && (
        <Box style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          color: 'red',
          backgroundColor: 'rgba(0,0,0,0.9)',
          padding: '20px',
          borderRadius: '8px'
        }}>
          {error}
        </Box>
      )}

      <iframe
        src={`${haProxyUrl}/lovelace/0`}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#111'
        }}
        title="Home Assistant Dashboard"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </Box>
  )
}
