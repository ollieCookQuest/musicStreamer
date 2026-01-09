#!/bin/sh
set -e

# Initialize database if it doesn't exist
if [ ! -f "/app/prisma/dev.db" ]; then
  echo "Initializing database..."
  cd /app
  # Regenerate Prisma Client with correct binary targets for the runtime environment
  npx prisma generate
  npx prisma db push
fi

# Start the application
exec node server.js
