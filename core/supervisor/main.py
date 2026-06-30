from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, status
import os
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import docker
import json
from pathlib import Path
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import logging
import requests
import psutil
from datetime import datetime, timedelta
import jwt
from entity_registry import EntityRegistry, Entity, Device, State

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Elits Supervisor", version="0.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HA Configuration
HA_URL = "http://31.3.77.20:8123"
HA_TOKEN_FILE = Path("/data/elits/ha_token.txt")
HA_TOKEN = None

if HA_TOKEN_FILE.exists():
    with open(HA_TOKEN_FILE) as f:
        HA_TOKEN = f.read().strip()
        logger.info(f"✅ HA Token loaded")

# JWT Secret for Elits Auth
JWT_SECRET = "elits-platform-secret-key-change-in-production"
JWT_ALGORITHM = "HS256"

# Docker client
client = None

def get_docker_client():
    global client
    if client is None:
        try:
            client = docker.from_env()
            logger.info("✅ Docker client initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Docker client: {e}")
            raise
    return client

# Entity Registry
entity_registry = EntityRegistry()

# WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

ws_manager = ConnectionManager()

def on_entity_change():
    import asyncio
    asyncio.create_task(ws_manager.broadcast({
        "type": "state_changed",
        "data": entity_registry.get_entities()
    }))

entity_registry.add_listener(on_entity_change)

ADDONS_DIR = Path("/data/elits/addons")
OFFICIAL_ADDONS_DIR = Path("/opt/elits/addons")
GITHUB_REPO = "lpt2007/elits-platform-addons"

# Cache za GitHub API odgovore (5 minut TTL)
_github_cache = {}
_github_cache_time = {}
GITHUB_CACHE_TTL = 300  # 5 minut

def cached_github_request(url: str):
    """Cache GitHub API requests za 5 minut"""
    import time
    current_time = time.time()
    
    # Preveri če imamo veljaven cache
    if url in _github_cache and url in _github_cache_time:
        if current_time - _github_cache_time[url] < GITHUB_CACHE_TTL:
            return _github_cache[url]
    
    # Naredi nov request
    response = requests.get(url, timeout=10)
    
    # Shrani v cache
    _github_cache[url] = response
    _github_cache_time[url] = current_time
    
    return response


SYSTEM_CONTAINERS = ['supervisor', 'supervisor_test', 'webui', 'webui_test', 'dns', 'observer', 'cli']

# ============ HA AUTHENTICATION ============

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Authenticate user via HA API"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # Verify token with HA - uporabi /api/config ker /api/users ne obstaja
    try:
        response = requests.get(
            f"{HA_URL}/api/config",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            config = response.json()
            # Vrnemo user info iz config
            return {
                "id": "admin",
                "name": config.get("location_name", "Admin"),
                "is_admin": True,
                "is_owner": True
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
    except requests.exceptions.RequestException as e:
        logger.error(f"HA Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Home Assistant not available",
        )

def create_elits_token(user_id: str, username: str):
    """Create JWT token for Elits"""
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode = {
        "sub": user_id,
        "username": username,
        "exp": expire
    }
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

# ============ HA API ENDPOINTS ============

@app.get("/api/ha/auth/login")
async def ha_login(username: str, password: str):
    """Login via HA and get Elits token"""
    try:
        # Try to login to HA
        response = requests.post(
            f"{HA_URL}/auth/token",
            data={
                "grant_type": "password",
                "username": username,
                "password": password
            },
            timeout=10
        )
        
        if response.status_code == 200:
            ha_token_data = response.json()
            ha_token = ha_token_data.get('access_token')
            
            # Get user info
            user_response = requests.get(
                f"{HA_URL}/api/user",
                headers={"Authorization": f"Bearer {ha_token}"},
                timeout=10
            )
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                elits_token = create_elits_token(user_data.get('id'), user_data.get('name'))
                
                return {
                    "access_token": elits_token,
                    "token_type": "bearer",
                    "user": user_data
                }
        
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    except requests.exceptions.RequestException as e:
        logger.error(f"HA login error: {e}")
        raise HTTPException(status_code=503, detail="Home Assistant not available")

@app.get("/api/ha/config")
async def get_ha_config():
    """Get HA configuration"""
    return {
        "url": HA_URL,
        "connected": HA_TOKEN is not None
    }

@app.get("/api/ha/entities")
async def get_ha_entities(current_user: dict = Depends(get_current_user)):
    """Get all HA entities"""
    if not HA_TOKEN:
        raise HTTPException(status_code=401, detail="HA token not configured")
    
    try:
        response = requests.get(
            f"{HA_URL}/api/states",
            headers={"Authorization": f"Bearer {HA_TOKEN}"},
            timeout=10
        )
        return response.json()
    except Exception as e:
        logger.error(f"Failed to fetch HA entities: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to HA")

@app.get("/api/ha/users")
async def get_ha_users(current_user: dict = Depends(get_current_user)):
    """Get HA users - use /api/config ker /api/users ne obstaja"""
    if not HA_TOKEN:
        raise HTTPException(status_code=401, detail="HA token not configured")
    
    try:
        # HA nima /api/users endpointa, uporabimo /api/config
        response = requests.get(
            f"{HA_URL}/api/config",
            headers={"Authorization": f"Bearer {HA_TOKEN}"},
            timeout=10
        )
        if response.status_code == 200:
            config = response.json()
            # Vrnemo uporabnike iz config
            return {
                "users": [
                    {
                        "id": "admin",
                        "name": config.get("location_name", "Admin"),
                        "is_admin": True,
                        "is_owner": True
                    }
                ],
                "ha_config": config
            }
        return {"users": [], "ha_config": {}}
    except Exception as e:
        logger.error(f"Failed to fetch HA config: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to HA")

@app.post("/api/ha/entities/{entity_id}/state")
async def set_ha_entity_state(entity_id: str, request: dict, current_user: dict = Depends(get_current_user)):
    """Set HA entity state"""
    if not HA_TOKEN:
        raise HTTPException(status_code=401, detail="HA token not configured")
    
    try:
        response = requests.post(
            f"{HA_URL}/api/states/{entity_id}",
            headers={"Authorization": f"Bearer {HA_TOKEN}"},
            json=request,
            timeout=10
        )
        return response.json()
    except Exception as e:
        logger.error(f"Failed to set HA entity state: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to HA")

# ============ HELPER FUNCTIONS ============

async def get_system_stats():
    return {
        "cpu_percent": psutil.cpu_percent(interval=0.1),
        "memory": {
            "total": psutil.virtual_memory().total,
            "available": psutil.virtual_memory().available,
            "percent": psutil.virtual_memory().percent
        },
        "disk": {
            "total": psutil.disk_usage("/").total,
            "used": psutil.disk_usage("/").used,
            "percent": psutil.disk_usage("/").percent
        }
    }

def load_manifest(slug: str, repo_dir: Path) -> Optional[Dict]:
    manifest_path = repo_dir / slug / "elits-addon.json"
    if manifest_path.exists():
        try:
            with open(manifest_path) as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading manifest for {slug}: {e}")
    return None

def fetch_github_addons() -> List[Dict]:
    """Fetch addons from GitHub repository - supports system/ and apps/ structure"""
    try:
        import base64
        addons = []
        
        # Preveri oba direktorija: system/ in apps/
        for category in ['system', 'apps']:
            url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{category}"
            response = cached_github_request(url)
            
            if response.status_code != 200:
                logger.warning(f"Could not fetch {category}/ directory")
                continue
            
            for item in response.json():
                if item['type'] == 'dir':
                    slug = item['name']
                    
                    # Poskusi config.json (novi format) ali elits-addon.json (stari format)
                    for config_file in ['config.json', 'elits-addon.json']:
                        manifest_url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{category}/{slug}/{config_file}"
                        manifest_response = cached_github_request(manifest_url)
                        
                        if manifest_response.status_code == 200:
                            content = base64.b64decode(manifest_response.json()['content']).decode('utf-8')
                            manifest_data = json.loads(content)
                            
                            # Dodaj manjkajoča polja z privzetimi vrednostmi
                            manifest_data['type'] = category  # system ali apps
                            manifest_data['category'] = manifest_data.get('category', category.title())
                            manifest_data['stage'] = manifest_data.get('stage', 'stable')
                            manifest_data['path'] = f"{category}/{slug}"  # Pot za namestitev
                            
                            addons.append(manifest_data)
                            break  # Našel config, ne išči več
        
        logger.info(f"Found {len(addons)} addons on GitHub")
        return addons
    except Exception as e:
        logger.error(f"Error fetching GitHub addons: {e}")
        return []

def compare_versions(v1: str, v2: str) -> int:
    try:
        if v1 == 'latest' or v2 == 'latest':
            return 0
        parts1 = [int(x) for x in v1.split('.')]
        parts2 = [int(x) for x in v2.split('.')]
        for p1, p2 in zip(parts1, parts2):
            if p1 < p2: return -1
            elif p1 > p2: return 1
        return 0
    except:
        return 0

# ============ STARTUP ============

@app.on_event("startup")
async def startup_event():
    try:
        get_docker_client()
        await register_system_entities()
        await register_addon_entities()
        logger.info("✅ Elits Supervisor v0.5.0 started with HA Auth")
    except Exception as e:
        logger.error(f"Startup error: {e}")

async def register_system_entities():
    entity_registry.async_register_entity(entity_id="sensor.cpu_usage", name="CPU Usage", platform="system", unit_of_measurement="%", icon="mdi:cpu-64-bit")
    entity_registry.async_register_entity(entity_id="sensor.memory_usage", name="Memory Usage", platform="system", unit_of_measurement="%", icon="mdi:memory")
    entity_registry.async_register_entity(entity_id="sensor.disk_usage", name="Disk Usage", platform="system", unit_of_measurement="%", icon="mdi:harddisk")
    await update_system_states()

async def update_system_states():
    try:
        stats = await get_system_stats()
        entity_registry.async_set_state("sensor.cpu_usage", str(stats['cpu_percent']))
        entity_registry.async_set_state("sensor.memory_usage", str(stats['memory']['percent']))
        entity_registry.async_set_state("sensor.disk_usage", str(stats['disk']['percent']))
    except Exception as e:
        logger.error(f"Error updating system states: {e}")

async def register_addon_entities():
    try:
        docker_client = get_docker_client()
        for container in docker_client.containers.list(all=True):
            if container.name.startswith('elits_'):
                slug = container.name.replace('elits_', '')
                if slug in SYSTEM_CONTAINERS:
                    continue
                
                device = Device(id=f"addon_{slug}", name=slug.replace('-', ' ').title(), manufacturer="Elits Platform", identifiers={"addon": slug})
                entity_registry.register_device(device)
                entity_registry.async_register_entity(entity_id=f"switch.{slug}", name=slug.replace('-', ' ').title(), platform=slug, device_id=f"addon_{slug}", icon="mdi:application")
                state = 'on' if container.status == 'running' else 'off'
                entity_registry.async_set_state(f"switch.{slug}", state)
    except Exception as e:
        logger.error(f"Error registering addon entities: {e}")

# ============ ENTITY API ============

@app.get("/api/entities")
async def get_entities():
    await update_system_states()
    return {entity_id: entity.to_dict() for entity_id, entity in entity_registry.get_entities().items()}

# ============ DASHBOARD API ============

DASHBOARDS_FILE = Path("/data/elits/dashboards.json")

def load_dashboards():
    try:
        if DASHBOARDS_FILE.exists():
            with open(DASHBOARDS_FILE) as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Error loading dashboards: {e}")
    return []

def save_dashboards(dashboards):
    try:
        DASHBOARDS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(DASHBOARDS_FILE, 'w') as f:
            json.dump(dashboards, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving dashboards: {e}")

@app.get("/api/dashboards")
async def api_get_dashboards():
    return load_dashboards()

@app.get("/api/dashboards/{dashboard_id}")
async def api_get_dashboard(dashboard_id: str):
    dashboards = load_dashboards()
    dashboard = next((d for d in dashboards if d.get('id') == dashboard_id), None)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return dashboard

@app.post("/api/dashboards")
async def api_create_dashboard(request: dict):
    dashboards = load_dashboards()
    dashboard = {
        "id": request.get('id', f"dashboard_{len(dashboards) + 1}"),
        "name": request.get('name', 'New Dashboard'),
        "config": request.get('config', {}),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    dashboards.append(dashboard)
    save_dashboards(dashboards)
    return dashboard

@app.put("/api/dashboards/{dashboard_id}")
async def api_update_dashboard(dashboard_id: str, request: dict):
    dashboards = load_dashboards()
    dashboard = next((d for d in dashboards if d.get('id') == dashboard_id), None)
    if dashboard:
        dashboard.update({
            "name": request.get('name', dashboard.get('name')),
            "config": request.get('config', dashboard.get('config')),
            "updated_at": datetime.now().isoformat()
        })
    else:
        dashboard = {
            "id": dashboard_id,
            "name": request.get('name', 'Dashboard'),
            "config": request.get('config', {}),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        dashboards.append(dashboard)
    save_dashboards(dashboards)
    return dashboard

@app.delete("/api/dashboards/{dashboard_id}")
async def api_delete_dashboard(dashboard_id: str):
    dashboards = load_dashboards()
    dashboard = next((d for d in dashboards if d.get('id') == dashboard_id), None)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    dashboards.remove(dashboard)
    save_dashboards(dashboards)
    return {"status": "deleted"}

# ============ ADDON API ============

@app.get("/api/addons")
async def list_addons():
    addons = []
    docker_client = get_docker_client()
    for container in docker_client.containers.list(all=True):
        if container.name.startswith('elits_'):
            slug = container.name.replace('elits_', '')
            if slug in SYSTEM_CONTAINERS:
                continue
            manifest = None
            for repo_dir in [ADDONS_DIR, OFFICIAL_ADDONS_DIR]:
                manifest = load_manifest(slug, repo_dir)
                if manifest:
                    break
            addons.append({
                "slug": slug,
                "name": manifest['name'] if manifest else slug,
                "state": container.status,
                "status": "healthy" if container.status == "running" else "stopped",
                "version": manifest['version'] if manifest else "unknown",
                "ports": {str(k): v for k, v in manifest.get('ports', {}).items()} if manifest else {},
            })
    return addons

@app.get("/api/addons/{slug}")
async def get_addon(slug: str):
    docker_client = get_docker_client()
    try:
        container = docker_client.containers.get(f"elits_{slug}")
        manifest = None
        for repo_dir in [ADDONS_DIR, OFFICIAL_ADDONS_DIR]:
            manifest = load_manifest(slug, repo_dir)
            if manifest:
                break
        return {
            "slug": slug,
            "name": manifest['name'] if manifest else slug,
            "state": container.status,
            "version": manifest['version'] if manifest else "unknown",
        }
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.post("/api/addons/{slug}/start")
async def start_addon(slug: str):
    docker_client = get_docker_client()
    try:
        container = docker_client.containers.get(f"elits_{slug}")
        container.start()
        entity_registry.async_set_state(f"switch.{slug}", "on")
        return {"status": "started", "slug": slug}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.post("/api/addons/{slug}/stop")
async def stop_addon(slug: str):
    docker_client = get_docker_client()
    try:
        container = docker_client.containers.get(f"elits_{slug}")
        container.stop()
        entity_registry.async_set_state(f"switch.{slug}", "off")
        return {"status": "stopped", "slug": slug}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.post("/api/addons/{slug}/uninstall")
async def uninstall_addon(slug: str):
    docker_client = get_docker_client()
    try:
        container = docker_client.containers.get(f"elits_{slug}")
        container.stop()
        container.remove()
        entity_registry.async_remove_device(f"addon_{slug}")
        return {"status": "uninstalled", "slug": slug}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Addon not found")

@app.get("/api/store")
async def get_store():
    docker_client = get_docker_client()
    github_addons = fetch_github_addons()
    for addon in github_addons:
        try:
            docker_client.containers.get(f"elits_{addon['slug']}")
            addon['installed'] = True
        except docker.errors.NotFound:
            addon['installed'] = False
    return github_addons

@app.post("/api/store/install")
async def install_addon(request: dict):
    """Install addon from GitHub repository using docker-py SDK"""
    import subprocess
    import shutil
    import tarfile
    import io
    
    docker_client = get_docker_client()
    slug = request.get('slug')
    
    # Pridobi manifest iz GitHub
    github_addons = fetch_github_addons()
    manifest_data = next((a for a in github_addons if a['slug'] == slug), None)
    if not manifest_data:
        raise HTTPException(status_code=404, detail="Addon not found in GitHub repository")
    
    # Preveri če je že nameščen
    try:
        docker_client.containers.get(f"elits_{slug}")
        raise HTTPException(status_code=400, detail="Addon already installed")
    except docker.errors.NotFound:
        pass
    
    try:
        # Pot iz GitHub (npr. "system/postgresql")
        addon_path = manifest_data.get('path', f"{manifest_data.get('type', 'apps')}/{slug}")
        
        # Kloniraj repo v /tmp
        temp_dir = f"/tmp/elits-addon-{slug}"
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        
        logger.info(f"Cloning addon from GitHub: {addon_path}")
        subprocess.run([
            "git", "clone", "--depth", "1", "--filter=blob:none", "--sparse",
            f"https://github.com/{GITHUB_REPO}.git", temp_dir
        ], check=True, capture_output=True)
        
        # Checkout samo potrebni direktorij
        subprocess.run(["git", "sparse-checkout", "set", addon_path],
                      cwd=temp_dir, check=True, capture_output=True)
        
        addon_dir = os.path.join(temp_dir, addon_path)
        
        # Zgradi Docker image z docker-py SDK
        image_name = f"elits-{slug}:latest"
        logger.info(f"Building Docker image: {image_name}")
        
        image, build_logs = docker_client.images.build(
            path=addon_dir,
            tag=image_name,
            rm=True,
            forcerm=True
        )
        
        # Log build output
        for log in build_logs:
            if 'stream' in log:
                logger.debug(log['stream'].strip())
        
        # Pripravi ports (preslikaj iz config.json formata)
        ports = {}
        for container_port, host_port in manifest_data.get('ports', {}).items():
            # container_port je npr. "5432/tcp", host_port je npr. 5432
            ports[container_port] = host_port
        
        # Pripravi environment
        environment = {}
        options = manifest_data.get('options', {})
        for env_key, env_value in manifest_data.get('environment', {}).items():
            # Zamenjaj ${option_name} z dejansko vrednostjo
            if env_value.startswith('${') and env_value.endswith('}'):
                option_name = env_value[2:-1]
                environment[env_key] = options.get(option_name, '')
            else:
                environment[env_key] = env_value
        
        # Pripravi volumes
        volumes = {
            f"/data/addons-data/{slug}": {'bind': '/data', 'mode': 'rw'}
        }
        
        # Ustvari direktorij za podatke
        os.makedirs(f"/data/addons-data/{slug}", exist_ok=True)
        
        # Zaženi kontejner
        logger.info(f"Starting container: elits_{slug}")
        container = docker_client.containers.run(
            image_name,
            name=f"elits_{slug}",
            detach=True,
            ports=ports,
            environment=environment,
            volumes=volumes,
            network="elits-net",
            restart_policy={"Name": "unless-stopped"},
        )
        
        # Počisti temp directory
        shutil.rmtree(temp_dir, ignore_errors=True)
        
        # Registriraj entity v HA
        await register_addon_entities()
        
        logger.info(f"✅ Addon {slug} installed successfully")
        return {"status": "installed", "slug": slug, "container_id": container.id}
    
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to clone addon: {e.stderr.decode()}")
        raise HTTPException(status_code=500, detail=f"Clone failed: {e.stderr.decode()}")
    except docker.errors.BuildError as e:
        logger.error(f"Failed to build Docker image: {e}")
        raise HTTPException(status_code=500, detail=f"Build failed: {str(e)}")
    except Exception as e:
        logger.error(f"Error installing addon: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/updates")
async def check_updates():
    docker_client = get_docker_client()
    updates = []
    github_addons = fetch_github_addons()
    for container in docker_client.containers.list(all=True):
        if container.name.startswith('elits_'):
            slug = container.name.replace('elits_', '')
            if slug in SYSTEM_CONTAINERS:
                continue
            manifest = None
            for repo_dir in [ADDONS_DIR, OFFICIAL_ADDONS_DIR]:
                manifest = load_manifest(slug, repo_dir)
                if manifest:
                    break
            if not manifest:
                continue
            github_addon = next((a for a in github_addons if a['slug'] == slug), None)
            if github_addon:
                installed_version = manifest['version']
                available_version = github_addon['version']
                update_available = compare_versions(installed_version, available_version) < 0
                updates.append({
                    "slug": slug,
                    "name": manifest['name'],
                    "current_version": installed_version,
                    "available_version": available_version,
                    "update_available": update_available,
                })
    return updates

@app.get("/api/system/info")
async def get_system_info():
    docker_client = get_docker_client()
    return {
        "version": "0.5.0",
        "addons_count": len(docker_client.containers.list(filters={"name": "elits_"})),
        "docker_version": docker_client.version()['Version'],
        "entities_count": len(entity_registry.get_entities()),
        "ha_connected": HA_TOKEN is not None
    }

@app.get("/observer/system")
async def observer_system():
    return await get_system_stats()

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Elits Supervisor v0.5.0 with HA Auth starting on port 1977...")
    uvicorn.run(app, host="0.0.0.0", port=1977)

# ============ HA SYNC ============

@app.post("/api/ha/sync")
async def sync_ha_entities(current_user: dict = Depends(get_current_user)):
    """Sinhroniziraj HA entitete z Elits Entity Registry"""
    if not HA_TOKEN:
        raise HTTPException(status_code=401, detail="HA token not configured")
    
    try:
        # Pridobi HA entitete
        response = requests.get(
            f"{HA_URL}/api/states",
            headers={"Authorization": f"Bearer {HA_TOKEN}"},
            timeout=10
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch HA entities")
        
        ha_entities = response.json()
        synced_count = 0
        
        # Sinhroniziraj vsako HA entiteto
        for ha_entity in ha_entities:
            entity_id = ha_entity.get('entity_id')
            state = ha_entity.get('state', 'unknown')
            attributes = ha_entity.get('attributes', {})
            
            # Določi domeno
            domain = entity_id.split('.')[0] if '.' in entity_id else 'unknown'
            
            # Registriraj entiteto v Elits registry
            if not entity_registry.get_entity(entity_id):
                entity_registry.async_register_entity(
                    entity_id=entity_id,
                    name=attributes.get('friendly_name', entity_id),
                    platform="home_assistant",
                    unit_of_measurement=attributes.get('unit_of_measurement'),
                    icon=attributes.get('icon'),
                    device_class=attributes.get('device_class')
                )
            
            # Posodobi stanje
            entity_registry.async_set_state(entity_id, state, attributes)
            synced_count += 1
        
        logger.info(f"✅ Synced {synced_count} HA entities")
        
        return {
            "status": "success",
            "synced_count": synced_count,
            "total_ha_entities": len(ha_entities)
        }
    
    except Exception as e:
        logger.error(f"HA sync error: {e}")
        raise HTTPException(status_code=500, detail="Failed to sync HA entities")

@app.get("/api/ha/lovelace/dashboards")
async def get_ha_dashboards(current_user: dict = Depends(get_current_user)):
    """Pridobi HA Lovelace dashboard-e"""
    if not HA_TOKEN:
        raise HTTPException(status_code=401, detail="HA token not configured")
    
    try:
        # HA nima direktnega API za dashboard-e, vrnemo default
        return {
            "dashboards": [
                {
                    "id": "default",
                    "name": "Default",
                    "url": f"{HA_URL}/lovelace/default_view"
                }
            ]
        }
    except Exception as e:
        logger.error(f"Failed to fetch HA dashboards: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch HA dashboards")

# ============ HA LOVELACE API ============

@app.get("/api/ha/lovelace/config")
async def get_ha_lovelace_config(current_user: dict = Depends(get_current_user)):
    """Pridobi HA Lovelace konfiguracijo"""
    if not HA_TOKEN:
        raise HTTPException(status_code=401, detail="HA token not configured")
    
    try:
        response = requests.get(
            f"{HA_URL}/api/lovelace/default_view",
            headers={"Authorization": f"Bearer {HA_TOKEN}"},
            timeout=10
        )
        return response.json() if response.status_code == 200 else None
    except Exception as e:
        logger.error(f"Failed to fetch HA Lovelace config: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to HA")

@app.get("/api/ha/lovelace/card/{card_type}")
async def get_ha_lovelace_card(card_type: str):
    """Pridobi HA Lovelace kartico (JavaScript kodo)"""
    # To bi moral biti endpoint ki vrne JavaScript za HA kartico
    # Zaenkrat vrnemo placeholder
    return {
        "type": card_type,
        "note": "HA Lovelace cards need to be loaded from HA frontend"
    }

# ============ ADDON LOGS ============

@app.get("/api/addons/{slug}/logs")
async def get_addon_logs(slug: str):
    """Pridobi loge za addon"""
    docker_client = get_docker_client()
    try:
        container = docker_client.containers.get(f"elits_{slug}")
        # Pridobi zadnjih 100 vrstic logov
        logs = container.logs(tail=100).decode('utf-8', errors='ignore')
        return {"logs": logs, "slug": slug}
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail=f"Addon {slug} not found")
    except Exception as e:
        logger.error(f"Error getting logs for {slug}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
