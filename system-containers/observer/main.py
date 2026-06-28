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


@app.get("/gpu")
async def get_gpu_info():
    """Get GPU information"""
    import subprocess
    
    try:
        # Uporabi CSV format ki je bolj zanesljiv
        result = subprocess.run(
            ['nvidia-smi', '--query-gpu=name,memory.total,memory.used,temperature.gpu,utilization.gpu,power.draw,power.limit', '--format=csv,noheader,nounits'],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0 and result.stdout.strip():
            gpus = []
            for line in result.stdout.strip().split('\n'):
                parts = [p.strip() for p in line.split(',')]
                if len(parts) >= 7:
                    gpus.append({
                        'name': parts[0],
                        'memory_total': int(parts[1]),
                        'memory_used': int(parts[2]),
                        'temperature': int(parts[3]),
                        'utilization': int(parts[4]),
                        'power_draw': float(parts[5]),
                        'power_limit': float(parts[6]),
                    })
            return {'gpus': gpus}
        else:
            return {'gpus': [], 'error': f'nvidia-smi failed: {result.stderr}'}
    except Exception as e:
        return {'gpus': [], 'error': str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=80)

@app.get("/updates")
async def check_updates():
    """Check for addon updates"""
    import json
    from pathlib import Path
    
    updates = []
    addons_dir = Path("/data/elits/addons")
    
    if addons_dir.exists():
        for addon_dir in addons_dir.iterdir():
            if addon_dir.is_dir():
                manifest_path = addon_dir / "elits-addon.json"
                if manifest_path.exists():
                    try:
                        with open(manifest_path) as f:
                            manifest = json.load(f)
                        
                        # Preveri če je addon nameščen
                        try:
                            container = client.containers.get(f"elits_{manifest['slug']}")
                            installed = True
                            # Tukaj bi lahko preverili verzijo iz container labels
                            installed_version = manifest.get('version', 'unknown')
                        except:
                            installed = False
                            installed_version = None
                        
                        updates.append({
                            "slug": manifest['slug'],
                            "name": manifest['name'],
                            "description": manifest.get('description', ''),
                            "category": manifest.get('category', ''),
                            "current_version": installed_version,
                            "available_version": manifest.get('version', 'unknown'),
                            "update_available": False,  # Zaenkrat vedno False
                            "installed": installed,
                            "stage": manifest.get('stage', 'stable'),
                            "repository": manifest.get('repository', 'official')
                        })
                    except Exception as e:
                        print(f"Error reading manifest for {addon_dir.name}: {e}")
    
    return updates


