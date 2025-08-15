Docker setup for PyqHub

Prerequisites:
- Docker and Docker Compose installed.

Quick start (from repository root):

```bash
# build and start both services (app + postgres)
docker compose up --build

# run in background
# docker compose up --build -d

# stop and remove containers
# docker compose down
```

Notes:
- The services will read environment variables from the existing `.env` file. Do NOT commit secrets to source control.
- `DB_HOST` is set to `db` inside the compose network so the app connects to the Postgres container.
- To run the app image alone (without compose):

```bash
docker build -t pyqhub:latest .
docker run --env-file .env -p 3002:3002 pyqhub:latest
```
