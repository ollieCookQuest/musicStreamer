#!/bin/sh
set -e

cd /app

# Always regenerate Prisma Client to ensure correct binary target for runtime
echo "Generating Prisma Client for runtime environment..."
npx prisma generate

# Initialize database if it doesn't exist
if [ ! -f "/app/prisma/dev.db" ]; then
  echo "Initializing database..."
  npx prisma db push
  echo "Database initialized successfully"
else
  echo "Database already exists, skipping initialization"
fi

# Start the application
echo "Starting Next.js server..."
exec node server.js
