# ERP System Scripts

This folder contains utility scripts to help you run and manage the ERP system.

## Available Scripts

### start-erp.bat (Windows)
Starts the complete ERP system (frontend + backend) on Windows.

**Usage**:
```bash
.\scripts\start-erp.bat
```

**What it does**:
- Starts the FastAPI backend on port 8000
- Starts the Next.js frontend on port 3000
- Opens both in separate command windows

### start-erp.sh (Linux/Mac)
Starts the complete ERP system (frontend + backend) on Linux/Mac.

**Usage**:
```bash
chmod +x ./scripts/start-erp.sh
./scripts/start-erp.sh
```

**What it does**:
- Starts the FastAPI backend on port 8000
- Starts the Next.js frontend on port 3000
- Runs both in the background

## Manual Start

If you prefer to start services manually:

### Backend Only
```bash
cd backend
python main.py
```

### Frontend Only
```bash
npm run dev
```

## Docker Start

For Docker deployment, use the docker-compose files in the `docker/` directory:

```bash
cd docker
docker-compose up
```

See the [Deployment Guide](../docs/getting-started/deployment.md) for more details.
