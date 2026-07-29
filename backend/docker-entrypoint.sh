#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy --config prisma.config.ts

echo "Starting application..."
exec node dist/src/main