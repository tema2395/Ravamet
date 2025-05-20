from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List, Optional, Dict, Any, Callable

from app.core.config import settings
from app.api import auth, users, vacancies, responses
from app.db.session import get_db


class AppFactory:
    """
    Factory class to create and configure the FastAPI application
    """
    
    @staticmethod
    def create_app(config: Optional[Dict[str, Any]] = None) -> FastAPI:
        """
        Create and configure the FastAPI application
        
        Args:
            config (Optional[Dict[str, Any]]): Configuration overrides
            
        Returns:
            FastAPI: Configured FastAPI application instance
        """
        # Apply config overrides if provided
        if config:
            for key, value in config.items():
                if hasattr(settings, key):
                    setattr(settings, key, value)
        
        # Create FastAPI instance
        app = FastAPI(
            title=settings.PROJECT_NAME,
            description=settings.PROJECT_DESCRIPTION,
            version=settings.PROJECT_VERSION,
            docs_url="/docs",
            redoc_url="/redoc",
            openapi_url=f"{settings.API_V1_STR}/openapi.json",
        )
        
        # Add middleware
        AppFactory._configure_middleware(app)
        
        # Include API routers
        AppFactory._include_routers(app)
        
        # Add base endpoints
        AppFactory._add_base_endpoints(app)
        
        # Add event handlers
        AppFactory._add_event_handlers(app)
        
        return app
    
    @staticmethod
    def _configure_middleware(app: FastAPI) -> None:
        """
        Configure middleware for the application
        
        Args:
            app (FastAPI): FastAPI application instance
        """
        # Add CORS middleware
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.CORS_ORIGINS,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    @staticmethod
    def _include_routers(app: FastAPI) -> None:
        """
        Include API routers
        
        Args:
            app (FastAPI): FastAPI application instance
        """
        api_prefix = settings.API_V1_STR
        
        # Include API routers with dependencies
        app.include_router(auth.router, prefix=f"{api_prefix}/auth", tags=["auth"])
        app.include_router(users.router, prefix=f"{api_prefix}/users", tags=["users"])
        app.include_router(vacancies.router, prefix=f"{api_prefix}/vacancies", tags=["vacancies"])
        app.include_router(responses.router, prefix=f"{api_prefix}/responses", tags=["responses"])
    
    @staticmethod
    def _add_base_endpoints(app: FastAPI) -> None:
        """
        Add basic endpoints
        
        Args:
            app (FastAPI): FastAPI application instance
        """
        
        @app.get("/", tags=["root"])
        def read_root():
            return {
                "message": f"Welcome to {settings.PROJECT_NAME}",
                "version": settings.PROJECT_VERSION,
                "docs_url": "/docs",
            }
        
        @app.get("/health", tags=["health"])
        def health_check():
            return {
                "status": "ok",
                "api_version": settings.PROJECT_VERSION,
            }
    
    @staticmethod
    def _add_event_handlers(app: FastAPI) -> None:
        """
        Add event handlers for the application
        
        Args:
            app (FastAPI): FastAPI application instance
        """
        
        @app.on_event("startup")
        async def startup_event():
            # Add startup actions here (e.g. database connection check)
            pass
        
        @app.on_event("shutdown")
        async def shutdown_event():
            # Add shutdown actions here (e.g. close connections)
            pass
    
    @staticmethod
    def run_app(app: Optional[FastAPI] = None, **kwargs) -> None:
        """
        Run the FastAPI application
        
        Args:
            app (Optional[FastAPI]): FastAPI application instance
            **kwargs: Additional keyword arguments for uvicorn.run
        """
        app = app or AppFactory.create_app()
        
        host = kwargs.get("host", settings.HOST)
        port = kwargs.get("port", settings.PORT)
        reload = kwargs.get("reload", settings.RELOAD)
        
        # If reload is True, we need to pass the application module as a string
        if reload:
            uvicorn.run(
                "app.factory:create_app",
                host=host,
                port=port,
                reload=reload,
            )
        else:
            # If reload is False, we can pass the application instance directly
            uvicorn.run(
                app,
                host=host,
                port=port,
            )


def create_app() -> FastAPI:
    """
    Create the FastAPI application using the factory
    
    Returns:
        FastAPI: Configured FastAPI application instance
    """
    return AppFactory.create_app()
