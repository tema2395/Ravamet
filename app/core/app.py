from fastapi import FastAPI, Depends
from typing import Optional, Dict, Any, List

from app.factory import AppFactory
from app.core.config import settings
from app.core.container import container
from app.services.factory import ServiceFactory


class Application:
    """
    Application class that manages the entire application lifecycle
    """
    
    _instance = None
    _app: Optional[FastAPI] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Application, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize the application components"""
        # Register services
        self._register_services()
    
    def _register_services(self):
        """Register services in the container"""
        # Register user service
        container.register("user_service", ServiceFactory.create_user_service)
        
        # Register vacancy service
        container.register("vacancy_service", ServiceFactory.create_vacancy_service)
        
        # Register response service
        container.register("response_service", ServiceFactory.create_response_service)
    
    @property
    def app(self) -> FastAPI:
        """Get the FastAPI application instance"""
        if self._app is None:
            self._app = AppFactory.create_app()
        return self._app
    
    def run(self, **kwargs):
        """Run the application"""
        AppFactory.run_app(self.app, **kwargs)
    
    @classmethod
    def get_instance(cls):
        """Get the application instance"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance


# Create a global application instance
app_instance = Application()


def get_application() -> Application:
    """Get the application instance"""
    return app_instance


def get_app() -> FastAPI:
    """Get the FastAPI application instance"""
    return app_instance.app
