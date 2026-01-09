#!/bin/bash

# Production startup script for Music Streamer
# Handles certificate generation, database setup, build, and startup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

echo ""
print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "Music Streamer - Production Startup"
print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check Node.js
print_info "Step 1/5: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20 or higher."
    exit 1
fi
NODE_VERSION=$(node --version)
print_success "Node.js found: $NODE_VERSION"
echo ""

# Step 2: Check .env file
print_info "Step 2/5: Checking environment configuration..."
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    print_info "Please create a .env file with the following variables:"
    echo ""
    echo "DATABASE_URL=\"file:./prisma/dev.db\""
    echo "SONOS_CLIENT_ID=your_sonos_client_id"
    echo "SONOS_CLIENT_SECRET=your_sonos_client_secret"
    echo "SONOS_CALLBACK_URL=https://your-domain.com/api/sonos/callback"
    echo ""
    exit 1
fi
print_success ".env file exists"
echo ""

# Step 3: Generate SSL certificates
print_info "Step 3/5: Setting up SSL certificates..."
if [ ! -f "certs/server.crt" ] || [ ! -f "certs/server.key" ]; then
    print_info "SSL certificates not found. Generating..."
    
    # Create certs directory if it doesn't exist
    mkdir -p certs
    
    # Get hostname/IP for certificate
    HOSTNAME=$(hostname -I | awk '{print $1}')
    if [ -z "$HOSTNAME" ]; then
        HOSTNAME="localhost"
    fi
    
    print_info "  → Generating certificate for: localhost, $HOSTNAME"
    
    # Generate self-signed certificate
    if openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout certs/server.key \
        -out certs/server.crt \
        -subj "/C=US/ST=State/L=City/O=MusicStreamer/CN=$HOSTNAME" \
        -addext "subjectAltName=IP:$HOSTNAME,DNS:localhost,DNS:$HOSTNAME" 2>/dev/null; then
        print_info "  → Certificate generated with Subject Alternative Names"
    else
        # Fallback for older OpenSSL versions
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout certs/server.key \
            -out certs/server.crt \
            -subj "/C=US/ST=State/L=City/O=MusicStreamer/CN=$HOSTNAME" 2>/dev/null
        print_info "  → Certificate generated (basic version)"
    fi
    
    # Set permissions
    chmod 600 certs/server.key
    chmod 644 certs/server.crt
    print_info "  → Set proper file permissions"
    
    print_success "SSL certificates generated successfully"
else
    print_success "SSL certificates already exist"
fi
echo ""

# Step 4: Set up database
print_info "Step 4/5: Setting up database..."
print_info "  → Generating Prisma Client..."
if npx prisma generate > /dev/null 2>&1; then
    print_success "Prisma Client generated"
else
    print_error "Failed to generate Prisma Client"
    exit 1
fi

print_info "  → Initializing database..."
if [ ! -f "prisma/dev.db" ]; then
    if npx prisma db push > /dev/null 2>&1; then
        print_success "Database initialized"
    else
        print_error "Failed to initialize database"
        exit 1
    fi
else
    print_success "Database already exists"
fi
echo ""

# Step 5: Build and start
print_info "Step 5/5: Building and starting application..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
fi

# Build the application
print_info "Building Next.js application (this may take a few minutes)..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

echo ""
print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "✓ Application ready to start!"
print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get hostname/IP for display
HOSTNAME=$(hostname -I | awk '{print $1}')
if [ -z "$HOSTNAME" ]; then
    HOSTNAME="localhost"
fi

print_info "Starting production server..."
print_info ""
print_info "📍 Access URLs:"
print_info "   • https://localhost:3000"
print_info "   • https://$HOSTNAME:3000"
echo ""
print_info "⚠️  Security Note:"
print_info "   You'll see a security warning because we're using a self-signed certificate."
print_info "   This is normal for local/private networks."
print_info "   Click 'Advanced' → 'Proceed to localhost (unsafe)' to continue."
echo ""
print_info "Press Ctrl+C to stop the server"
echo ""

# Start the application
exec npm start
