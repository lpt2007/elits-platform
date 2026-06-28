"""
Entity modeli
"""
from dataclasses import dataclass, field
from typing import Dict, Any, Optional
from datetime import datetime

@dataclass
class State:
    """Stanje entitete"""
    state: str
    attributes: Dict[str, Any] = field(default_factory=dict)
    last_changed: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)

@dataclass
class Entity:
    """Entiteta"""
    entity_id: str
    name: str
    domain: str  # sensor, switch, binary_sensor, etc.
    platform: str  # addon slug ali integracija
    device_id: Optional[str] = None
    state: State = field(default_factory=lambda: State(state="unknown"))
    unit_of_measurement: Optional[str] = None
    icon: Optional[str] = None
    device_class: Optional[str] = None
    category: Optional[str] = None  # diagnostic, config
    disabled: bool = False
    
    def to_dict(self):
        return {
            "entity_id": self.entity_id,
            "name": self.name,
            "domain": self.domain,
            "platform": self.platform,
            "device_id": self.device_id,
            "state": self.state.state,
            "attributes": {
                **self.state.attributes,
                "friendly_name": self.name,
                "unit_of_measurement": self.unit_of_measurement,
                "icon": self.icon,
                "device_class": self.device_class,
                "category": self.category
            },
            "last_changed": self.state.last_changed.isoformat(),
            "last_updated": self.state.last_updated.isoformat()
        }

@dataclass
class Device:
    """Naprava (addon, integracija)"""
    id: str
    name: str
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    sw_version: Optional[str] = None
    identifiers: Dict[str, str] = field(default_factory=dict)
    connections: Dict[str, str] = field(default_factory=dict)
    via_device: Optional[str] = None
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "manufacturer": self.manufacturer,
            "model": self.model,
            "sw_version": self.sw_version,
            "identifiers": self.identifiers,
            "connections": self.connections,
            "via_device": self.via_device
        }
