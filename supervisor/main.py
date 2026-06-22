from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import docker
import json
from pathlib import Path
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Elits Supervisor", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = docker.from_env()

ADDONS_DIR = Path("/data/elits/addons")
OFFICIAL_ADDONS_DIR = Path("/opt/elits/addons")

class AddonStatus(BaseModel):
    slug: str
    name: str
    state: str
    status: str
    version: str
    ports: Dict[str, int] = {}
    created_at: str
    started_at: str
    updated_at: str
    manifest: Optional[Dict] = None

class AddonManifest(BaseModel):
    name: str
    version: str
    slug: str
    description: str
    category: str
    url: str
    repository: str
    arch: List[str]
    init: bool
    ports: Dict[str, int]
    environment: Dict[str, str]
    volumes: Dict[str, str]
    image: str
    stage: str

def load_manifest(slug: str, repo_dir: Path) -> Optional[AddonManifest]:
    manifest_path = repo_dir / slug / "elits-addon.json"
    if manifest_path.exists():
        try:
            with open(manifest_path) as f:
                data = json.load(f)
                return AddonManifest(**data)
        except Exception as e:
            logger.error(f"Error loading manifest for {slug}: {e}")
    return None

SYSTEM_CONTAINERS = ['supervisor', 'supervisor_test', 'webui', 'webui_test', 'dns', 'observer', 'cli']

@app.get("/api/addons")
async def list_addons():
    addons = []
    for container in client.containers.list(all=True):
        if container.name.startswith('elits_'):
            slug = container.name.replace('elits_', '')
            if slug in SYSTEM_CONTAINERS:
                continue
            
            manifest = None
            manifest_dict = None
            for repo_dir in [ADDONS_DIR, OFFICIAL_ADDONS_DIR]:
                manifest = load_manifest(slug, repo_dir)
                if manifest:
                    manifest_dict = manifest.dict()
                    break

            addons.append(AddonStatus(
                slug=slug,
                name=manifest.name if manifest else slug,
                state=container.status,
                status="healthy" if container.status == "running" else "stopped",
                version=manifest.version if manifest else "unknown",
                ports={str(k): v for k, v in manifest.ports.items()} if manifest else {},
                created_at=container.attrs.get('Created'),
                started_at=container.attrs.get('State', {}).get('StartedAt'),
                updated_at=container.attrs.get('State', {}).get('StartedAt'),
                manifest=manifest_dict,
            ))
    return addons

@app.get("/api/addons/{slug}")
async def get_addon(slug: str):
    try:
        container = client.containers.get(f"elits_{slug}")
        manifest = None
        for repo_dir in [ADDONS_DIR, OFFICIAL_ADDONS_DIR]:
            manifest = load_manifest(slug, repo_dir)
            if manifest:
                break
        
        return {
            "slug": slug,
            "name": manifest.name if manifest else slug,
            "state": container.status,
            "status": "healthy" if container.status == "running" else "stopped",
            "version": manifest.version if manifest else "unknown",
            "ports": {str(k): v for k, v in manifest.ports.items()} if manifest else {},
            "created_at": container.attrs.get('Created'),
            "started_at": container.attrs.get('State', {}).get('StartedAt'),
            "updated_at": container.attrs.get('State', {}).get('StartedAt'),
            "manifest": manifest.dict() if manifest else None,
        }
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.post("/api/addons/{slug}/start")
async def start_addon(slug: str):
    try:
        container = client.containers.get(f"elits_{slug}")
        container.start()
        return {"status": "started", "slug": slug}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.post("/api/addons/{slug}/stop")
async def stop_addon(slug: str):
    try:
        container = client.containers.get(f"elits_{slug}")
        container.stop()
        return {"status": "stopped", "slug": slug}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.post("/api/addons/{slug}/restart")
async def restart_addon(slug: str):
    try:
        container = client.containers.get(f"elits_{slug}")
        container.restart()
        return {"status": "restarted", "slug": slug}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.post("/api/addons/{slug}/uninstall")
async def uninstall_addon(slug: str):
    try:
        container = client.containers.get(f"elits_{slug}")
        container.stop()
        container.remove()
        return {"status": "uninstalled", "slug": slug}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.get("/api/addons/{slug}/logs")
async def get_addon_logs(slug: str):
    try:
        container = client.containers.get(f"elits_{slug}")
        logs = container.logs(tail=100).decode('utf-8')
        return {"logs": logs.split('\n')}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.get("/api/store")
async def get_store():
    addons = []
    if ADDONS_DIR.exists():
        for addon_dir in ADDONS_DIR.iterdir():
            if addon_dir.is_dir():
                manifest = load_manifest(addon_dir.name, ADDONS_DIR)
                if manifest:
                    addon_data = manifest.dict()
                    try:
                        container = client.containers.get(f"elits_{manifest.slug}")
                        addon_data['installed'] = True
                    except docker.errors.NotFound:
                        addon_data['installed'] = False
                    addons.append(addon_data)
    return addons

@app.post("/api/store/install")
async def install_addon(request: dict):
    slug = request.get('slug')
    manifest = load_manifest(slug, ADDONS_DIR)
    if not manifest:
        raise HTTPException(status_code=404, detail="Addon not found in store")
    
    try:
        container = client.containers.get(f"elits_{slug}")
        raise HTTPException(status_code=400, detail="Addon already installed")
    except docker.errors.NotFound:
        pass
    
    try:
        container = client.containers.run(
            manifest.image,
            name=f"elits_{slug}",
            detach=True,
            ports=manifest.ports,
            environment=manifest.environment,
            volumes=manifest.volumes,
            restart_policy={"Name": "unless-stopped"},
        )
        return {"status": "installed", "slug": slug, "container_id": container.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/system/info")
async def get_system_info():
    return {
        "version": "0.2.0",
        "addons_count": len(client.containers.list(filters={"name": "elits_"})),
        "docker_version": client.version()['Version'],
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Elits Supervisor v0.2.0 starting on port 1977...")
    uvicorn.run(app, host="0.0.0.0", port=1977)
