from typing import Callable, Dict, Optional, Type, Any
from fastapi import Depends

# Simple dependency injection container
class Container:
    """
    A simple dependency injection container.
    This class manages dependencies for the application.
    """
    
    def __init__(self):
        self._services: Dict[str, Callable[..., Any]] = {}
        self._singletons: Dict[str, Any] = {}
    
    def register(self, name: str, factory: Callable[..., Any]) -> None:
        """
        Register a service factory
        
        Args:
            name (str): Name of the service
            factory (Callable[..., Any]): Factory function to create the service
        """
        self._services[name] = factory
    
    def register_singleton(self, name: str, factory: Callable[..., Any]) -> None:
        """
        Register a singleton service
        
        Args:
            name (str): Name of the service
            factory (Callable[..., Any]): Factory function to create the service
        """
        self._services[name] = factory
        # Mark as singleton
        self._singletons[name] = None
    
    def get(self, name: str) -> Any:
        """
        Get a service instance
        
        Args:
            name (str): Name of the service
            
        Returns:
            Any: Service instance
            
        Raises:
            KeyError: If service is not registered
        """
        if name not in self._services:
            raise KeyError(f"Service '{name}' not registered")
        
        # Return existing singleton instance if available
        if name in self._singletons and self._singletons[name] is not None:
            return self._singletons[name]
        
        # Create a new instance
        instance = self._services[name]()
        
        # Store singleton instance
        if name in self._singletons:
            self._singletons[name] = instance
        
        return instance
    
    def get_dependency(self, name: str) -> Callable[[], Any]:
        """
        Get a FastAPI dependency for a service
        
        Args:
            name (str): Name of the service
            
        Returns:
            Callable[[], Any]: FastAPI dependency
        """
        def dependency() -> Any:
            return self.get(name)
        
        return Depends(dependency)


# Create a global container instance
container = Container()
