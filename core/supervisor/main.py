#!/usr/bin/env python3
# =============================================================================
# Elits Platform - Supervisor Core v0.2.0
# Z dodatnimi endpointi za Web UI in Addon Store
# =============================================================================

import docker
import json
import os
import re
import asyncio
from pathlib import Path
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
import uvicorn
import requests
from datetime import datetime

# =============================================================================
# Konstante
# =============================================================================
ELITS_ROOT = Path("/data/elits")
ADDONS_DIR = ELITS_ROOT / "addons"
OFFICIAL_ADDONS_DIR = Path("/opt/elits/addons-official")  # Uradni addoni
CONFIG_FILE = ELITS_ROOT / "config.json"
ELITS_NETWORK = "elits-net"
SUPERVISOR_IP = "31.3.77.1"
SUPERVISOR_VERSION = "0.2.0"

# =============================================================================
# FastAPI App & Docker Client
# =============================================================================
app = FastAPI(title="Elits Supervisor", version=SUPERVISOR_VERSION)
client = docker.from_env()

# CORS za Web UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# Data Models
# =============================================================================
class AddonConfigOption(BaseModel):
    """Schema for addon configuration options"""
    type: str  # text, number, select, toggle, multi-select
    title: str
    description: Optional[str] = ""
    default: Any = None
    required: bool = True
    options: Optional[List[str]] = None  # For select/multi-select
    min: Optional[float] = None  # For number
    max: Optional[float] = None  # For number
    step: Optional[float] = None  # For number

class AddonManifest(BaseModel):
    """Schema for elits-addon.json manifest files"""
    slug: str
    name: str
    version: str
    description: str
    url: str
    image: str
    startup: str = "application"
    boot: str = "auto"
    init: bool = False
    arch: List[str] = ["amd64"]
    command: Optional[List[str]] = None
    working_dir: Optional[str] = None
    ports: Dict[str, int] = {}
    environment: Dict[str, Any] = {}
    volumes: Dict[str, Dict] = {}
    devices: List[str] = []
    network: str = ELITS_NETWORK
    ip_address: Optional[str] = None
    memory_limit: Optional[str] = None
    cpu_limit: Optional[int] = None
    gpu: bool = False
    cap_add: List[str] = []
    ulimits: Dict[str, Any] = {}
    healthcheck: Optional[Dict] = None
    web_ui: Optional[Dict] = {}
    dependencies: List[str] = []
    stage: str = "stable"
    
    # NEW: Configuration options for Web UI
    options: Dict[str, AddonConfigOption] = {}
    schema_version: str = "1.0"

class AddonStatus(BaseModel):
    """Addon status response"""
    slug: str
    name: str
    state: str  # running, stopped, starting, stopping
    status: str  # healthy, unhealthy, unknown
    version: str
    ip_address: Optional[str]
    ports: Dict[str, int]
    created_at: Optional[str]
    started_at: Optional[str]
    updated_at: Optional[str]
    logs: List[str] = []

class StoreAddon(BaseModel):
    """Addon from store"""
    slug: str
    name: str
    version: str
    description: str
    url: str
    image: str
    stage: str
    icon: Optional[str] = None
    category: str = "AI"
    installed: bool = False
    installed_version: Optional[str] = None
    update_available: bool = False

class InstallAddonRequest(BaseModel):
    """Request to install an addon"""
    slug: str
    repository: str = "official"  # official or custom repo URL
    config: Dict[str, Any] = {}

# =============================================================================
# Helper Functions
# =============================================================================
def load_config() -> Dict:
    """Load global configuration"""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return {"repositories": [], "addons": {}}

def save_config(config: Dict):
    """Save global configuration"""
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)

def load_manifest(slug: str, repo_path: Path) -> Optional[AddonManifest]:
    """Load addon manifest from JSON file"""
    manifest_path = repo_path / slug / "elits-addon.json"
    if not manifest_path.exists():
        return None
    with open(manifest_path, 'r') as f:
        data = json.load(f)
    return AddonManifest(**data)

def get_container_name(slug: str) -> str:
    """Generate container name: elits_<slug>"""
    return f"elits_{slug}"

def get_container_logs(slug: str, tail: int = 100) -> List[str]:
    """Get container logs"""
    try:
        container = client.containers.get(get_container_name(slug))
        logs = container.logs(tail=tail).decode('utf-8', errors='replace')
        return logs.split('\n')
    except Exception as e:
        return [f"Error getting logs: {str(e)}"]

def parse_duration_to_ns(duration) -> int:
    """Convert Docker time duration string to nanoseconds"""
    if duration is None:
        return 0
    if isinstance(duration, (int, float)):
        return int(duration)
    
    duration = str(duration).strip().lower()
    multipliers = {
        'ns': 1,
        'us': 1000,
        'ms': 1000000,
        's': 1000000000,
        'm': 60000000000,
        'h': 3600000000000,
    }
    
    for unit, mult in multipliers.items():
        if duration.endswith(unit):
            try:
                return int(float(duration[:-len(unit)]) * mult)
            except:
                return 0
    return 0

# =============================================================================
# API Endpoints - System
# =============================================================================
@app.get("/api/system/info")
async def get_system_info():
    """Get system information"""
    return {
        "version": SUPERVISOR_VERSION,
        "docker_version": client.version()['Version'],
        "os": os.uname().sysname,
        "arch": os.uname().machine,
        "cpu_count": os.cpu_count(),
        "memory_total": os.sysconf('SC_PAGE_SIZE') * os.sysconf('SC_PHYS_PAGES'),
        "disk_usage": {
            "total": os.statvfs('/').f_blocks * os.statvfs('/').f_frsize,
            "free": os.statvfs('/').f_bfree * os.statvfs('/').f_frsize,
        }
    }

@app.get("/api/system/stats")
async def get_system_stats():
    """Get real-time system stats"""
    import psutil
    
    return {
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory": {
            "total": psutil.virtual_memory().total,
            "available": psutil.virtual_memory().available,
            "percent": psutil.virtual_memory().percent,
        },
        "disk": {
            "total": psutil.disk_usage('/').total,
            "free": psutil.disk_usage('/').free,
            "percent": psutil.disk_usage('/').percent,
        }
    }

# =============================================================================
# API Endpoints - Addons
# =============================================================================
@app.get("/api/addons", response_model=List[AddonStatus])
async def list_addons():
    """List all installed addons"""
    addons = []
    
    for container in client.containers.list(all=True):
        if container.name.startswith('elits_'):
            slug = container.name.replace('elits_', '')
            
            # Try to load manifest
            manifest = None
            for repo_dir in [ADDONS_DIR, OFFICIAL_ADDONS_DIR]:
                manifest = load_manifest(slug, repo_dir)
                if manifest:
                    break
            
            addons.append(AddonStatus(
                slug=slug,
                name=manifest.name if manifest else slug,
                state=container.status,
                status="healthy" if container.status == "running" else "stopped",
                version=manifest.version if manifest else "unknown",
                ip_address=manifest.ip_address if manifest else None,
                ports={str(k): v for k, v in manifest.ports.items()} if manifest else {},
                created_at=container.attrs.get('Created'),
                started_at=container.attrs.get('State', {}).get('StartedAt'),
                updated_at=container.attrs.get('State', {}).get('StartedAt'),
            ))
    
    return addons

@app.get("/api/addons/{slug}")
async def get_addon(slug: str):
    """Get addon details"""
    try:
        container = client.containers.get(get_container_name(slug))
    except docker.errors.NotFound:
        container = None
    
    # Load manifest
    manifest = None
    for repo_dir in [ADDONS_DIR, OFFICIAL_ADDONS_DIR]:
        manifest = load_manifest(slug, repo_dir)
        if manifest:
            break
    
    if not manifest:
        raise HTTPException(status_code=404, detail="Addon not found")
    
    return {
        "manifest": manifest.dict(),
        "status": {
            "state": container.status if container else "not_installed",
            "logs": get_container_logs(slug) if container else [],
        }
    }

@app.post("/api/addons/{slug}/start")
async def start_addon(slug: str):
    """Start an addon"""
    try:
        container = client.containers.get(get_container_name(slug))
        container.start()
        return {"status": "started", "slug": slug}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.post("/api/addons/{slug}/stop")
async def stop_addon(slug: str):
    """Stop an addon"""
    try:
        container = client.containers.get(get_container_name(slug))
        container.stop()
        return {"status": "stopped", "slug": slug}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.post("/api/addons/{slug}/restart")
async def restart_addon(slug: str):
    """Restart an addon"""
    try:
        container = client.containers.get(get_container_name(slug))
        container.restart()
        return {"status": "restarted", "slug": slug}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.delete("/api/addons/{slug}")
async def uninstall_addon(slug: str):
    """Uninstall an addon"""
    try:
        container = client.containers.get(get_container_name(slug))
        container.stop()
        container.remove()
        return {"status": "uninstalled", "slug": slug}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.get("/api/addons/{slug}/logs")
async def get_addon_logs(slug: str, tail: int = 100):
    """Get addon logs"""
    return {"logs": get_container_logs(slug, tail)}

# =============================================================================
# API Endpoints - Store
# =============================================================================
@app.get("/api/store", response_model=List[StoreAddon])
async def get_store():
    """Get all available addons from store"""
    store_addons = []
    
    # Load official addons
    if OFFICIAL_ADDONS_DIR.exists():
        for addon_dir in OFFICIAL_ADDONS_DIR.iterdir():
            if addon_dir.is_dir():
                manifest = load_manifest(addon_dir.name, OFFICIAL_ADDONS_DIR)
                if manifest:
                    # Check if installed
                    installed = False
                    installed_version = None
                    try:
                        container = client.containers.get(get_container_name(addon_dir.name))
                        installed = True
                        installed_version = manifest.version
                    except:
                        pass
                    
                    store_addons.append(StoreAddon(
                        slug=manifest.slug,
                        name=manifest.name,
                        version=manifest.version,
                        description=manifest.description,
                        url=manifest.url,
                        image=manifest.image,
                        stage=manifest.stage,
                        category="AI" if "ai" in manifest.slug.lower() or "llm" in manifest.slug.lower() else "Database",
                        installed=installed,
                        installed_version=installed_version,
                        update_available=False,
                    ))
    
    # Load custom repositories
    config = load_config()
    for repo in config.get("repositories", []):
        # TODO: Fetch from GitHub
        pass
    
    return store_addons

@app.post("/api/store/install")
async def install_addon(request: InstallAddonRequest):
    """Install an addon from store"""
    # Load manifest
    if request.repository == "official":
        manifest = load_manifest(request.slug, OFFICIAL_ADDONS_DIR)
    else:
        # TODO: Fetch from custom repo
        raise HTTPException(status_code=400, detail="Custom repositories not implemented yet")
    
    if not manifest:
        raise HTTPException(status_code=404, detail="Addon not found in store")
    
    # Check dependencies
    for dep in manifest.dependencies:
        try:
            client.containers.get(get_container_name(dep))
        except docker.errors.NotFound:
            raise HTTPException(
                status_code=400,
                detail=f"Dependency not installed: {dep}. Please install it first."
            )
    
    # Prepare configuration
    config = request.config
    
    # Merge with defaults from manifest options
    for key, option in manifest.options.items():
        if key not in config and option.default is not None:
            config[key] = option.default
    
    # Build Docker run parameters
    run_kwargs = {
        "name": get_container_name(manifest.slug),
        "image": manifest.image,
        "detach": True,
        "network": manifest.network,
        "ports": manifest.ports,
        "environment": {**manifest.environment, **config},
        "volumes": manifest.volumes,
        "restart_policy": {"Name": "unless-stopped"},
    }
    
    if manifest.command:
        run_kwargs["command"] = manifest.command
    
    if manifest.working_dir:
        run_kwargs["working_dir"] = manifest.working_dir
    
    if manifest.ip_address:
        run_kwargs["network"] = manifest.network
        # IP address will be set via network config
    
    if manifest.memory_limit:
        run_kwargs["mem_limit"] = manifest.memory_limit
    
    if manifest.cpu_limit:
        run_kwargs["cpu_quota"] = manifest.cpu_limit * 100000
        run_kwargs["cpu_period"] = 100000
    
    if manifest.gpu:
        run_kwargs["device_requests"] = [
            docker.types.DeviceRequest(count=-1, capabilities=[['gpu']])
        ]
    
    if manifest.cap_add:
        run_kwargs["cap_add"] = manifest.cap_add
    
    if manifest.ulimits:
        run_kwargs["ulimits"] = [
            docker.types.Ulimit(name=k, soft=v.get('soft'), hard=v.get('hard'))
            for k, v in manifest.ulimits.items()
        ]
    
    # Create and start container
    try:
        container = client.containers.run(**run_kwargs)
        
        # Save addon config
        config_data = load_config()
        config_data["addons"][manifest.slug] = {
            "config": config,
            "installed_at": datetime.now().isoformat(),
            "version": manifest.version,
        }
        save_config(config_data)
        
        return {"status": "installed", "slug": manifest.slug, "container_id": container.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to install addon: {str(e)}")

# =============================================================================
# API Endpoints - Configuration
# =============================================================================
@app.get("/api/config")
async def get_config():
    """Get global configuration"""
    return load_config()

@app.post("/api/config/repositories")
async def add_repository(url: str):
    """Add a custom repository"""
    config = load_config()
    if url not in config["repositories"]:
        config["repositories"].append(url)
        save_config(config)
    return {"status": "added", "url": url}

@app.delete("/api/config/repositories")
async def remove_repository(url: str):
    """Remove a custom repository"""
    config = load_config()
    if url in config["repositories"]:
        config["repositories"].remove(url)
        save_config(config)
    return {"status": "removed", "url": url}

# =============================================================================
# WebSocket for real-time logs
# =============================================================================
@app.websocket("/ws/logs/{slug}")
async def websocket_logs(websocket: WebSocket, slug: str):
    """WebSocket for real-time addon logs"""
    await websocket.accept()
    
    try:
        container = client.containers.get(get_container_name(slug))
        logs = container.logs(stream=True, follow=True)
        
        for log in logs:
            await websocket.send_text(log.decode('utf-8', errors='replace'))
    except Exception as e:
        await websocket.send_text(f"Error: {str(e)}")
    finally:
        await websocket.close()

# =============================================================================
# Legacy endpoints (backward compatibility)
# =============================================================================
@app.post("/addons/{slug}/start")
async def legacy_start_addon(slug: str):
    """Legacy endpoint for backward compatibility"""
    return await start_addon(slug)

@app.post("/addons/{slug}/stop")
async def legacy_stop_addon(slug: str):
    """Legacy endpoint for backward compatibility"""
    return await stop_addon(slug)

@app.post("/addons/{slug}/restart")
async def legacy_restart_addon(slug: str):
    """Legacy endpoint for backward compatibility"""
    return await restart_addon(slug)

# =============================================================================
# Main
# =============================================================================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=1977)
