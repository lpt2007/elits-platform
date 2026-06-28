import { Container, Text, Group, Box, Progress, Badge } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconCpu, IconServer, IconDeviceSdCard, IconDeviceGamepad, IconNetwork } from '@tabler/icons-react'

export default function Hardware() {
  const navigate = useNavigate()

  const { data: systemStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: () => axios.get('/observer/system').then(res => res.data),
    refetchInterval: 5000,
  })

  const { data: gpuInfo } = useQuery({
    queryKey: ['gpu-info'],
    queryFn: () => axios.get('/observer/gpu').then(res => res.data),
    refetchInterval: 5000,
  })

  const formatBytes = (bytes) => {
    if (!bytes) return '0 GB'
    const gb = bytes / 1024 / 1024 / 1024
    return `${gb.toFixed(1)} GB`
  }

  const formatBytesSmall = (bytes) => {
    if (!bytes) return '0 bytes'
    if (bytes < 1024) return `${bytes} bytes`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
  }

  const gpu = gpuInfo?.gpus?.[0]
  const gpuMemoryPercent = gpu ? (gpu.memory_used / gpu.memory_total * 100) : 0

  return (
    <Container size="xl" py="xl" px="xl">
      <Group mb="lg">
        <IconArrowLeft size={20} style={{ cursor: 'pointer' }} onClick={() => navigate('/settings/system')} />
        <Box>
          <Text size="xl" fw={700} c="white">Hardware</Text>
          <Text size="xs" c="dimmed">System resources and hardware monitoring</Text>
        </Box>
      </Group>

      <div className="hardware-flex">
        {/* CPU Card */}
        <div className="hw-card">
          <Group justify="space-between" mb={8}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">CPU</Text>
            <div className="hw-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <IconCpu size={12} color="white" />
            </div>
          </Group>
          <Text size="xl" fw={700} mb={2} c="white" style={{ lineHeight: 1.2 }}>
            {systemStats?.cpu_percent?.toFixed(1) || 0}%
          </Text>
          <Text size="xs" c="dimmed" mb={8}>{systemStats?.cpu?.cores || 8} cores</Text>
          <Progress value={systemStats?.cpu_percent || 0} size={4} radius={2} style={{ background: 'rgba(255,255,255,0.1)' }} styles={{ bar: { background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' } }} />
          
          {/* Stats box kot GPU */}
          <div style={{ background: 'rgba(102, 126, 234, 0.1)', borderRadius: 6, padding: 8, marginTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <div>
                <Text size="xs" c="dimmed">Status</Text>
                <Text size="xs" fw={600} c="teal">Optimal</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Cores</Text>
                <Text size="xs" fw={600} c="white">{systemStats?.cpu?.cores || 8}</Text>
              </div>
            </div>
          </div>
        </div>

        {/* Memory Card */}
        <div className="hw-card">
          <Group justify="space-between" mb={8}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">Memory</Text>
            <div className="hw-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <IconServer size={12} color="white" />
            </div>
          </Group>
          <Text size="xl" fw={700} mb={2} c="white" style={{ lineHeight: 1.2 }}>
            {systemStats?.memory?.percent?.toFixed(1) || 0}%
          </Text>
          <Text size="xs" c="dimmed" mb={8}>{formatBytes(systemStats?.memory?.total - systemStats?.memory?.available)}</Text>
          <Progress value={systemStats?.memory?.percent || 0} size={4} radius={2} style={{ background: 'rgba(255,255,255,0.1)' }} styles={{ bar: { background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)' } }} />
          
          {/* Stats box kot GPU */}
          <div style={{ background: 'rgba(240, 147, 251, 0.1)', borderRadius: 6, padding: 8, marginTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <div>
                <Text size="xs" c="dimmed">Used</Text>
                <Text size="xs" fw={600} c="white">{formatBytes(systemStats?.memory?.total - systemStats?.memory?.available)}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Free</Text>
                <Text size="xs" fw={600} c="teal">{formatBytes(systemStats?.memory?.available)}</Text>
              </div>
            </div>
          </div>
        </div>

        {/* Disk Card */}
        <div className="hw-card">
          <Group justify="space-between" mb={8}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">Disk</Text>
            <div className="hw-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <IconDeviceSdCard size={12} color="white" />
            </div>
          </Group>
          <Text size="xl" fw={700} mb={2} c="white" style={{ lineHeight: 1.2 }}>
            {systemStats?.disk?.percent?.toFixed(1) || 0}%
          </Text>
          <Text size="xs" c="dimmed" mb={8}>{formatBytes(systemStats?.disk?.used)}</Text>
          <Progress value={systemStats?.disk?.percent || 0} size={4} radius={2} style={{ background: 'rgba(255,255,255,0.1)' }} styles={{ bar: { background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)' } }} />
          
          {/* Stats box kot GPU */}
          <div style={{ background: 'rgba(79, 172, 254, 0.1)', borderRadius: 6, padding: 8, marginTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <div>
                <Text size="xs" c="dimmed">Used</Text>
                <Text size="xs" fw={600} c="white">{formatBytes(systemStats?.disk?.used)}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Free</Text>
                <Text size="xs" fw={600} c="orange">{formatBytes(systemStats?.disk?.total - systemStats?.disk?.used)}</Text>
              </div>
            </div>
          </div>
        </div>

        {/* GPU Card */}
        <div className="hw-card">
          <Group justify="space-between" mb={8}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">GPU</Text>
            <div className="hw-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <IconDeviceGamepad size={12} color="white" />
            </div>
          </Group>
          <Text size="sm" fw={700} mb={1} c="white" style={{ wordBreak: 'break-word', lineHeight: 1.2 }}>{gpu?.name || 'No GPU'}</Text>
          <Text size="xs" c="dimmed" mb={8}>{gpu?.memory_total ? `${(gpu.memory_total / 1024).toFixed(0)} GB` : 'N/A'}</Text>
          {gpu && (
            <div style={{ background: 'rgba(67, 233, 123, 0.1)', borderRadius: 6, padding: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 }}>
                <div><Text size="xs" c="dimmed">Memory</Text><Text size="xs" fw={600} c="white">{gpu.memory_used ? `${(gpu.memory_used / 1024).toFixed(1)}/${(gpu.memory_total / 1024).toFixed(0)} GB` : 'N/A'}</Text></div>
                <div><Text size="xs" c="dimmed">Temp</Text><Text size="xs" fw={600} c="white">{gpu.temperature ? `${gpu.temperature}°C` : 'N/A'}</Text></div>
                <div><Text size="xs" c="dimmed">Util</Text><Text size="xs" fw={600} c="white">{gpu.utilization ? `${gpu.utilization}%` : 'N/A'}</Text></div>
                <div><Text size="xs" c="dimmed">Power</Text><Text size="xs" fw={600} c="white">{gpu.power_draw ? `${gpu.power_draw} W` : 'N/A'}</Text></div>
              </div>
              <Progress value={gpuMemoryPercent} size={4} radius={2} style={{ background: 'rgba(255,255,255,0.1)' }} styles={{ bar: { background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' } }} />
            </div>
          )}
        </div>
      </div>

      {/* Network Card */}
      <div className="hw-card" style={{ marginTop: 0 }}>
        <Group justify="space-between" mb="md">
          <Group><IconNetwork size={18} /><Text size="md" fw={700} c="white">Network Statistics</Text></Group>
          <Badge variant="gradient" gradient={{ from: '#667eea', to: '#764ba2' }} size="sm" radius="xl">LIVE</Badge>
        </Group>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <div style={{ padding: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 6, borderLeft: '3px solid #40c057' }}>
            <Text size="xs" c="dimmed" fw={500} mb={2}>⬆ Sent</Text>
            <Text size="sm" fw={700} c="white" style={{ fontFamily: 'Courier New, monospace' }}>{formatBytesSmall(systemStats?.network?.bytes_sent || 0)}</Text>
          </div>
          <div style={{ padding: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 6, borderLeft: '3px solid #4facfe' }}>
            <Text size="xs" c="dimmed" fw={500} mb={2}> Received</Text>
            <Text size="sm" fw={700} c="white" style={{ fontFamily: 'Courier New, monospace' }}>{formatBytesSmall(systemStats?.network?.bytes_recv || 0)}</Text>
          </div>
          <div style={{ padding: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 6, borderLeft: '3px solid #f093fb' }}>
            <Text size="xs" c="dimmed" fw={500} mb={2}> Packets</Text>
            <Text size="sm" fw={700} c="white" style={{ fontFamily: 'Courier New, monospace' }}>{systemStats?.network?.packets_sent || 0}</Text>
          </div>
          <div style={{ padding: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 6, borderLeft: '3px solid #f5576c' }}>
            <Text size="xs" c="dimmed" fw={500} mb={2}>⬇ Packets</Text>
            <Text size="sm" fw={700} c="white" style={{ fontFamily: 'Courier New, monospace' }}>{systemStats?.network?.packets_recv || 0}</Text>
          </div>
        </div>
      </div>

      <style>{`
        .hardware-flex {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .hardware-flex > .hw-card {
          flex: 1;
          min-width: 0;
        }
        .hw-card {
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px;
        }
        .hw-icon {
          width: 24px;
          height: 24px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </Container>
  )
}
