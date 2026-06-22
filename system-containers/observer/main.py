from fastapi import FastAPI
import psutil
import docker
import requests
from typing import Dict, List
import platform
import socket
import os

app = FastAPI(title="Elits Observer", version="0.1.0")
client = docker.from_env()

@app.get("/")
async def root():
    return {"status": "ok", "service": "Elits Observer"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/system")
async def system_info():
    """Get system information"""
    return {
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory": {
            "total": psutil.virtual_memory().total,
            "available": psutil.virtual_memory().available,
            "percent": psutil.virtual_memory().percent
        },
        "disk": {
            "total": psutil.disk_usage('/').total,
            "used": psutil.disk_usage('/').used,
            "free": psutil.disk_usage('/').free,
            "percent": psutil.disk_usage('/').percent
        },
        "network": psutil.net_io_counters()._asdict()
    }

@app.get("/host/info")
async def host_info():
    """Get host system information"""
    return {
        "hostname": socket.gethostname(),
        "operating_system": platform.system(),
        "os_version": platform.version(),
        "architecture": platform.machine(),
        "python_version": platform.python_version(),
        "kernel": platform.release(),
        "uptime": os.popen('uptime -p').read().strip() if os.path.exists('/proc/uptime') else "unknown",
        "timezone": os.popen('timedatectl show -p Timezone --value').read().strip() if os.path.exists('/usr/bin/timedatectl') else "unknown"
    }

@app.get("/containers")
async def list_containers():
    """List all containers"""
    containers = []
    for container in client.containers.list(all=True):
        containers.append({
            "id": container.id[:12],
            "name": container.name,
            "status": container.status,
            "image": container.image.tags[0] if container.image.tags else container.image.id,
            "created": container.attrs.get('Created')
        })
    return containers

@app.get("/stats/{container_id}")
async def container_stats(container_id: str):
    """Get container statistics"""
    try:
        container = client.containers.get(container_id)
        stats = container.stats(stream=False)
        return {
            "container": container.name,
            "cpu_percent": stats['cpu_stats']['cpu_usage']['total_usage'] / stats['cpu_stats']['system_cpu_usage'] * 100,
            "memory_usage": stats['memory_stats']['usage'],
            "memory_limit": stats['memory_stats']['limit']
        }
    except docker.errors.NotFound:
        return {"error": "Container not found"}

@app.get("/logs")
async def system_logs():
    """Get system logs"""
    return {
        "docker_version": client.version()['Version'],
        "containers_count": len(client.containers.list()),
        "images_count": len(client.images.list())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=80)
