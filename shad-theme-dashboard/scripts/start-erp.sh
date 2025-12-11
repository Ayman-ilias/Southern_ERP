#!/bin/bash

echo "========================================"
echo "  RMG ERP System - Starting..."
echo "========================================"
echo ""
echo "This will start:"
echo "- PostgreSQL Database (Port 5432)"
echo "- FastAPI Backend (Port 8000)"
echo "- Next.js Frontend (Port 2222)"
echo ""
echo "Default Credentials:"
echo "  Username: admin"
echo "  Password: admin"
echo ""
echo "Frontend will be available at: http://localhost:2222"
echo "Backend API docs at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo "========================================"
echo ""

docker-compose up

echo ""
echo "========================================"
echo "  Services stopped"
echo "========================================"
