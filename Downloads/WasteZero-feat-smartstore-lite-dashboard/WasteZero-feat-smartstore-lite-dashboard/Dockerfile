# Multi-stage build for React frontend and Python backend
FROM node:18-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Python backend stage
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python backend files
COPY app.py .
COPY utils/ ./utils/
COPY model/ ./model/
COPY data/ ./data/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/dist ./static

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"] 