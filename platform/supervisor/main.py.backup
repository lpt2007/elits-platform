#!/usr/bin/env python3
import docker
import json
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uvicorn

ELITS_ROOT = Path("/data/elits")
ADDONS_DIR = ELITS_ROOT / "addons"
ELITS_NETWORK = "elits-net"
SUPERVISOR_IP = "31.3.77.1"

app = FastAPI(title="Elits Supervisor", version="0.1.0")
client = docker.from_env()

class AddonManifest(BaseModel):
    slug: str
    name: str
    version: str
    image: str
    network: str = ELITS_NETWORK
    ip_address: str | None = None
    ports: dict = {}
    environment: dict = {}
    volumes: dict = {}
    devices: list = []
    memory_limit: str | None = None
    cpu_limit: int | None = None
    gpu: bool = False
    cap_add: list = []
    ulimits: dict = {}
    healthcheck: dict | None = None
    description: str = ""

def load_manifest(slug: str) -> AddonManifest | None:
    manifest_path = ADDONS_DIR / slug / "elits-addon.json"
    if not manifest_path.exists():
        return None
    with open(manifest_path, 'r') as f:
        data = json.load(f)
    return AddonManifest(**data)

def get_container_name(slug: str) -> str:
    return f"elits_{slug}"

@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0", "network": ELITS_NETWORK}

@app.get("/addons")
async def list_addons():
    addons = []
    if not ADDONS_DIR.exists():
        return {"addons": []}
    for slug in os.listdir(ADDONS_DIR):
        manifest = load_manifest(slug)
        if not manifest:
            continue
        status = "not_installed"
        try:
            container = client.containers.get(get_container_name(slug))
            status = container.status
        except docker.errors.NotFound:
            pass
        addons.append({
            "slug": manifest.slug,
            "name": manifest.name,
            "version": manifest.version,
            "status": status,
            "description": manifest.description
        })
    return {"addons": addons}

@app.post("/addons/{slug}/start")
async def start_addon(slug: str):
    manifest = load_manifest(slug)
    if not manifest:
        raise HTTPException(status_code=404, detail=f"Addon '{slug}' not found")
    container_name = get_container_name(slug)
    try:
        try:
            existing = client.containers.get(container_name)
            if existing.status == "running":
                return {"status": "already_running", "slug": slug}
            existing.stop()
            existing.remove()
        except docker.errors.NotFound:
            pass
        host_config = client.api.create_host_config(
            network_mode=ELITS_NETWORK,
            port_bindings=manifest.ports if manifest.ports else None,
            devices=[{"PathOnHost": d, "PathInContainer": d, "CgroupPermissions": "rwm"} for d in manifest.devices] if manifest.devices else None,
            cap_add=manifest.cap_add if manifest.cap_add else None,
            mem_limit=manifest.memory_limit if manifest.memory_limit else None,
            nano_cpus=manifest.cpu_limit * 10**9 if manifest.cpu_limit else None,
            ulimits=[docker.types.Ulimit(name="memlock", soft=-1, hard=-1)] if manifest.ulimits.get("memlock") == -1 else None,
            runtime="nvidia" if manifest.gpu else None,
        )
        env = manifest.environment.copy() if manifest.environment else {}
        env["SUPERVISOR_TOKEN"] = "elits-supervisor-token"
        env["HASSIO"] = SUPERVISOR_IP
        env["HASSIO_TOKEN"] = env.get("SUPERVISOR_TOKEN")
        container = client.containers.run(
            image=manifest.image,
            name=container_name,
            environment=env,
            volumes=manifest.volumes,
            ports=manifest.ports,
            network=ELITS_NETWORK,
            ipv4_address=manifest.ip_address,
            host_config=host_config,
            healthcheck=manifest.healthcheck,
            restart_policy={"Name": "unless-stopped"},
            detach=True,
        )
        return {"status": "started", "slug": slug, "container_id": container.short_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/self/info")
async def hassio_self_info():
    return {"result": "ok", "data": {"version": "0.1.0", "arch": "amd64", "supervisor": "elits"}}

if __name__ == "__main__":
    for path in [ADDONS_DIR, ELITS_ROOT / "share", ELITS_ROOT / "models"]:
        path.mkdir(parents=True, exist_ok=True)
    uvicorn.run(app, host="0.0.0.0", port=1977)
