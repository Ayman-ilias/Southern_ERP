FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
COPY requirements.prod.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -r requirements.prod.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 3333

# Run the application (dev mode - production uses gunicorn via docker-compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3333", "--reload"]
