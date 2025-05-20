#!/usr/bin/env python
import argparse
import os
import sys

# Add the parent directory to the path to make imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.app import app_instance
from app.core.config import settings


def main():
    parser = argparse.ArgumentParser(description="Ravamet API server")
    parser.add_argument(
        "--host",
        type=str,
        default=settings.HOST,
        help=f"Host to bind the server to (default: {settings.HOST})"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=settings.PORT,
        help=f"Port to bind the server to (default: {settings.PORT})"
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        default=settings.RELOAD,
        help="Enable auto-reload for development (default: True)"
    )
    parser.add_argument(
        "--no-reload",
        action="store_false",
        dest="reload",
        help="Disable auto-reload"
    )
    parser.add_argument(
        "--env-file",
        type=str,
        default=".env",
        help="Path to .env file (default: .env)"
    )
    
    args = parser.parse_args()
    
    # Set environment file
    if args.env_file:
        os.environ["ENV_FILE"] = args.env_file
        # Reload environment variables
        from dotenv import load_dotenv
        load_dotenv(args.env_file, override=True)
    
    # Run app with the provided configuration
    app_instance.run(
        host=args.host,
        port=args.port,
        reload=args.reload
    )


if __name__ == "__main__":
    main()
