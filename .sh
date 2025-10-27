echo "=== Step 1: Pulling latest changes from Git ==="
git pull || { echo "Git pull failed. Stopping."; exit 1; }

echo "=== Step 2: Building new Docker images ==="
docker-compose build || { echo "Docker build failed. Stopping."; exit 1; }

echo "=== Step 3: Stopping and removing old containers ==="
docker-compose down

echo "=== Step 4: Starting new containers ==="
docker-compose up -d || { echo "Docker up failed."; exit 1; }

echo "=== Step 5: Cleaning up unused Docker resources ==="
docker system prune -a --volumes -f

echo "=== Deployment complete! ==="