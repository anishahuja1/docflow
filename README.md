# DocFlow — Async Document Processing Workflow System

DocFlow is a production-style full-stack application designed to handle asynchronous document processing. It allows users to upload multiple documents, tracks their processing progress in real-time via Server-Sent Events (SSE), extracts key metadata and content (PDF, TXT, DOCX, CSV, etc.), and provides tools for reviewing and exporting the results.

## Architecture

```
[Frontend (React)] <--- SSE / REST ---> [Backend (FastAPI)]
                                           |      ^
                                           |      |
                                     [Celery Worker] <---> [Redis]
                                           |
                                     [PostgreSQL]
```

- **Frontend**: React 18 (Vite), TypeScript, Tailwind CSS, TanStack Query.
- **Backend**: FastAPI with async SQLAlchemy 2.0 and PostgreSQL.
- **Background Tasks**: Celery with Redis as broker.
- **Real-time Tracking**: Redis Pub/Sub for worker-to-backend events, SSE for backend-to-frontend updates.
- **Storage**: Local filesystem for uploaded documents (Docker volumes).

## Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Setup and Run

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd docflow
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Start the services:**
   ```bash
   docker compose up --build
   ```

4. **Access the application:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - API Base: `http://localhost:8000/api/v1`

## Manual Database Migrations

Migrations are handled by Alembic. To apply migrations manually inside the container:
```bash
docker compose exec backend alembic upgrade head
```

## Assumptions & Tradeoffs

- **Security**: CORS is set to allow all origins (`*`) for development. Production would require strict CORS.
- **Storage**: Files are saved to a Docker volume in `/uploads`. In a distributed environment, S3 or similar object storage should be used.
- **Worker**: The Celery worker runs synchronously for easier database handling within tasks, while the FastAPI app is fully asynchronous.
- **SSE Heartbeat**: Implemented a 15-second heartbeat to prevent connection timeouts in proxies/load balancers.

## Sample Files

You can test the system using the files in the `samples/` directory:
- `sample.txt`: Lorem Ipsum text.
- `sample.csv`: Fake data CSV.
- Any local `.pdf`, `.docx`, or image files (`.png`, `.jpg`).

## AI Usage
Developed with the assistance of Antigravity AI coding assistant.
