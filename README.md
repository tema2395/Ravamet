# Ravamet API

REST API for job vacancies and responses.

## Features

- User authentication and management
- Vacancy posting and management
- Response tracking and status updates
- RESTful API endpoints following best practices
- Factory pattern for application initialization
- Dependency injection for better testability

## Technology Stack

- FastAPI - Modern, fast web framework for building APIs
- SQLAlchemy - SQL toolkit and ORM
- PostgreSQL - Relational database
- Pydantic - Data validation and settings management
- JWT - Authentication mechanism

## Architecture

The application follows a clean, modular architecture with the following key components:

### Factory Pattern

We use the Factory pattern to create and configure the FastAPI application. This provides benefits such as:

- Centralized configuration
- Easier testing
- Modular initialization
- Customization options

The main factory class (`AppFactory`) creates and configures the application, while the `Application` class manages the entire application lifecycle.

### Dependency Injection

Services are designed to be easily injectable, allowing for better testability and separation of concerns. The application uses:

- Constructor-based dependency injection in services
- FastAPI's dependency injection system
- A simple container for managing dependencies

### Service Layer

Business logic is encapsulated in service classes, separated from the API layer. Each service follows a similar pattern:

- Constructor-based dependency injection
- Methods for CRUD operations
- Business rule validation
- Transactions management

## Project Structure

```
app/
├── api/                  # API endpoints
│   ├── auth.py           # Authentication endpoints
│   ├── responses.py      # Response endpoints
│   ├── users.py          # User endpoints
│   └── vacancies.py      # Vacancy endpoints
├── core/                 # Core functionality
│   ├── app.py            # Application class
│   ├── auth.py           # Authentication logic
│   ├── config.py         # Configuration settings
│   └── container.py      # Dependency injection container
├── db/                   # Database related
│   ├── models.py         # Database models
│   └── session.py        # Database session management
├── models/               # Domain models
├── schemas/              # Pydantic schemas
│   ├── models.py         # Schema models
│   └── requests.py       # Request schemas
├── services/             # Business logic
│   ├── factory.py        # Service factory
│   ├── response.py       # Response service
│   ├── user.py           # User service
│   └── vacancy.py        # Vacancy service
├── factory.py            # Application factory
└── main.py               # Main application entry point
```

## Setup and Installation

### Prerequisites

- Python 3.8+
- PostgreSQL

### Local Development

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Generate a secure secret key:
   ```bash
   python generate_key.py
   ```
5. Create a `.env` file (you can copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
6. Edit the `.env` file with your configuration

7. Initialize the database:
   ```bash
   python init_db.py
   ```

8. Run the application:
   ```bash
   python run.py
   ```

### Docker

To run the application with Docker:

```bash
docker-compose up -d
```

## API Documentation

Once the application is running, you can access:

- API documentation: http://localhost:8000/docs
- Alternative API documentation: http://localhost:8000/redoc

## Development Commands

The project includes a Makefile for common development tasks:

```bash
# Install dependencies
make install

# Run the application
make run

# Initialize the database
make db-init

# Build Docker image
make docker-build

# Run with Docker
make docker-run

# Run with Docker Compose in development mode
make docker-dev

# Run tests
make test

# Run linting
make lint
```

## License

[MIT](LICENSE)
