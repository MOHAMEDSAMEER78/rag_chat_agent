#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.docker .env
  echo "Please edit the .env file and add your GOOGLE_API_KEY"
  echo "Then run this script again"
  exit 1
fi

# Check if GOOGLE_API_KEY is empty in .env
if grep -q "GOOGLE_API_KEY=$" .env; then
  echo "GOOGLE_API_KEY is empty in .env file"
  echo "Please edit the .env file and add your GOOGLE_API_KEY"
  echo "Then run this script again"
  exit 1
fi

# Build and start the Docker containers
echo "Building and starting Docker containers..."
docker-compose up -d

# Print message
echo "=============================================="
echo "Containers are now running!"
echo "Access the application at http://localhost:3000"
echo "Access the admin dashboard at http://localhost:3000/admin"
echo "ChromaDB is running at http://localhost:8000"
echo "=============================================="
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo "==============================================" 