.PHONY: help install run db-init db-upgrade docker-build docker-run docker-dev test lint

# Default target executed when no arguments are given to make.
help:
	@echo "Available commands:"
	@echo "  install          Install dependencies"
	@echo "  run              Run the application"
	@echo "  db-init          Initialize the database"
	@echo "  docker-build     Build Docker image"
	@echo "  docker-run       Run in Docker container"
	@echo "  docker-dev       Run in Docker development mode"
	@echo "  test             Run tests"
	@echo "  lint             Run linting"

# Install dependencies
install:
	@echo "Installing dependencies..."
	pip install -r requirements.txt

# Run the application
run:
	@echo "Starting the application..."
	python run.py

# Initialize the database
db-init:
	@echo "Initializing the database..."
	python init_db.py

# Build Docker image
docker-build:
	@echo "Building Docker image..."
	docker build -t ravamet-api .

# Run in Docker container
docker-run:
	@echo "Running in Docker container..."
	docker run -p 8000:8000 --env-file .env ravamet-api

# Run with Docker Compose in development mode
docker-dev:
	@echo "Running with Docker Compose in development mode..."
	docker-compose up

# Run tests
test:
	@echo "Running tests..."
	pytest

# Run linting
lint:
	@echo "Running linting..."
	flake8 app tests
