"""
Entity Registry - centralni registry
"""
from typing import Dict, List, Optional, Callable
from .models import Entity, Device, State
import logging

logger = logging.getLogger(__name__)

class EntityRegistry:
    """Centralni registry vseh entitet"""
    
    def __init__(self):
        self.entities: Dict[str, Entity] = {}
        self.devices: Dict[str, Device] = {}
        self._listeners: List[Callable] = []
    
    def register_device(self, device: Device) -> Device:
        """Registriraj napravo"""
        self.devices[device.id] = device
        logger.info(f"Device registered: {device.id} ({device.name})")
        return device
    
    def async_register_entity(
        self,
        entity_id: str,
        name: str,
        platform: str,
        device_id: Optional[str] = None,
        unit_of_measurement: Optional[str] = None,
        icon: Optional[str] = None,
        device_class: Optional[str] = None,
        category: Optional[str] = None
    ) -> Entity:
        """Registriraj entiteto"""
        domain = entity_id.split('.')[0]
        
        entity = Entity(
            entity_id=entity_id,
            name=name,
            domain=domain,
            platform=platform,
            device_id=device_id,
            unit_of_measurement=unit_of_measurement,
            icon=icon,
            device_class=device_class,
            category=category
        )
        
        self.entities[entity_id] = entity
        logger.info(f"Entity registered: {entity_id} ({name})")
        self._notify_listeners()
        return entity
    
    def async_set_state(self, entity_id: str, state: str, attributes: Dict = None):
        """Posodobi stanje entitete"""
        if entity_id not in self.entities:
            logger.warning(f"Entity not found: {entity_id}")
            return
        
        entity = self.entities[entity_id]
        entity.state = State(
            state=state,
            attributes=attributes or {}
        )
        
        self._notify_listeners()
    
    def async_remove_entity(self, entity_id: str):
        """Odstrani entiteto"""
        if entity_id in self.entities:
            del self.entities[entity_id]
            logger.info(f"Entity removed: {entity_id}")
            self._notify_listeners()
    
    def async_remove_device(self, device_id: str):
        """Odstrani napravo in vse njene entitete"""
        if device_id in self.devices:
            del self.devices[device_id]
            # Odstrani vse entitete te naprave
            entities_to_remove = [
                e_id for e_id, e in self.entities.items() 
                if e.device_id == device_id
            ]
            for e_id in entities_to_remove:
                self.async_remove_entity(e_id)
            logger.info(f"Device removed: {device_id}")
    
    def get_entity(self, entity_id: str) -> Optional[Entity]:
        """Pridobi entiteto"""
        return self.entities.get(entity_id)
    
    def get_entities(self) -> Dict[str, Entity]:
        """Pridobi vse entitete"""
        return self.entities
    
    def get_entities_by_domain(self, domain: str) -> List[Entity]:
        """Pridobi entitete po domeni"""
        return [e for e in self.entities.values() if e.domain == domain]
    
    def get_entities_by_platform(self, platform: str) -> List[Entity]:
        """Pridobi entitete po platformi (addon)"""
        return [e for e in self.entities.values() if e.platform == platform]
    
    def get_device(self, device_id: str) -> Optional[Device]:
        """Pridobi napravo"""
        return self.devices.get(device_id)
    
    def add_listener(self, callback: Callable):
        """Dodaj listener za spremembe"""
        self._listeners.append(callback)
    
    def _notify_listeners(self):
        """Obvesti listenerje o spremembah"""
        for callback in self._listeners:
            try:
                callback()
            except Exception as e:
                logger.error(f"Listener error: {e}")
