#!/bin/bash

set -e

echo "🎵 Music Streamer Setup Script for Raspberry Pi"
echo "================================================"
echo ""

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

# Check if running on Raspberry Pi
check_architecture() {
    ARCH=$(uname -m)
    if [ "$ARCH" != "aarch64" ] && [ "$ARCH" != "arm64" ]; then
        print_error "This script is designed for ARM64 architecture (Raspberry Pi 4)"
        print_info "Detected architecture: $ARCH"
        exit 1
    fi
    print_success "Architecture check passed: $ARCH"
}

# Check if Docker is installed
check_docker() {
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker is already installed: $DOCKER_VERSION"
        return 0
    else
        print_info "Docker is not installed"
        return 1
    fi
}

# Check if Docker Compose is installed
check_docker_compose() {
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        print_success "Docker Compose is already installed"
        return 0
    else
        print_info "Docker Compose is not installed"
        return 1
    fi
}

# Install Docker
install_docker() {
    print_info "Installing Docker..."
    echo ""
    
    print_info "Step 1/5: Updating package list..."
    sudo apt-get update -qq
    print_success "Package list updated"
    
    print_info "Step 2/5: Installing prerequisites..."
    sudo apt-get install -y -qq \
        ca-certificates \
        curl \
        gnupg \
        lsb-release > /dev/null 2>&1
    print_success "Prerequisites installed"
    
    print_info "Step 3/5: Adding Docker's official GPG key..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg > /dev/null 2>&1
    print_success "GPG key added"
    
    print_info "Step 4/5: Setting up Docker repository..."
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    print_success "Repository configured"
    
    print_info "Step 5/5: Installing Docker Engine and Docker Compose..."
    sudo apt-get update -qq
    sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin > /dev/null 2>&1
    print_success "Docker Engine installed"
    
    # Add current user to docker group
    print_info "Adding $USER to docker group..."
    sudo usermod -aG docker $USER
    print_success "User added to docker group"
    print_info "Note: You may need to log out and back in for group changes to take effect"
    
    echo ""
    print_success "✓ Docker installation completed successfully!"
}

# Verify Docker installation
verify_docker() {
    if check_docker; then
        # Test Docker
        if sudo docker run --rm hello-world &> /dev/null; then
            print_success "Docker is working correctly"
            return 0
        else
            print_error "Docker is installed but not working correctly"
            return 1
        fi
    else
        return 1
    fi
}

# Generate SSL certificates
generate_certificates() {
    if [ -f "certs/server.crt" ] && [ -f "certs/server.key" ]; then
        print_success "SSL certificates already exist"
        return 0
    fi
    
    print_info "Generating SSL certificates..."
    
    # Create certs directory
    mkdir -p certs
    print_info "  → Created certs directory"
    
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
    
    print_success "✓ SSL certificates generated successfully"
    print_info "  Certificate location: certs/server.crt"
    print_info "  Private key location: certs/server.key"
    print_info "  Valid for: localhost, $HOSTNAME"
    print_info "  Note: This is a self-signed certificate. Your browser will show a security warning."
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_info ".env file not found. Creating template..."
        
        # Get hostname/IP for callback URL (HTTPS on port 443 via nginx)
        HOSTNAME=$(hostname -I | awk '{print $1}')
        if [ -z "$HOSTNAME" ]; then
            CALLBACK_URL="https://localhost/api/sonos/callback"
        else
            CALLBACK_URL="https://$HOSTNAME/api/sonos/callback"
        fi
        
        cat > .env << EOF
# Database
DATABASE_URL="file:./prisma/dev.db"

# Sonos API Credentials
SONOS_CLIENT_ID=your_sonos_client_id_here
SONOS_CLIENT_SECRET=your_sonos_client_secret_here
SONOS_CALLBACK_URL=$CALLBACK_URL

# Next.js
NEXT_TELEMETRY_DISABLED=1
EOF
        print_info "Created .env file template with callback URL: $CALLBACK_URL"
        print_info "Please update SONOS_CLIENT_ID and SONOS_CLIENT_SECRET with your credentials"
        return 1
    else
        print_success ".env file exists"
        return 0
    fi
}

# Build and start containers
start_app() {
    echo ""
    print_info "=========================================="
    print_info "Starting Application Build & Deployment"
    print_info "=========================================="
    echo ""
    
    # Step 1: Build Docker image
    print_info "Step 1/3: Building Docker image..."
    print_info "This may take 5-10 minutes on Raspberry Pi..."
    echo ""
    
    if docker compose build --progress=plain 2>&1 | tee /tmp/docker-build.log; then
        echo ""
        print_success "✓ Docker image built successfully!"
    else
        echo ""
        print_error "✗ Failed to build Docker image"
        print_info "Check /tmp/docker-build.log for details"
        return 1
    fi
    
    echo ""
    print_info "Step 2/3: Starting containers..."
    
    # Start containers
    if docker compose up -d; then
        print_success "✓ Containers started!"
    else
        print_error "✗ Failed to start containers"
        return 1
    fi
    
    echo ""
    print_info "Step 3/3: Verifying services..."
    print_info "Waiting for services to initialize (this may take 10-20 seconds)..."
    
    # Wait for services to be ready
    for i in {1..10}; do
        sleep 2
        if docker compose ps | grep -q "Up"; then
            echo -n "."
        fi
    done
    echo ""
    
    # Show container status
    echo ""
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_info "Container Status:"
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker compose ps
    echo ""
    
    # Check if containers are healthy
    APP_STATUS=$(docker compose ps app --format "{{.Status}}" 2>/dev/null || echo "unknown")
    NGINX_STATUS=$(docker compose ps nginx --format "{{.Status}}" 2>/dev/null || echo "unknown")
    
    if [[ "$APP_STATUS" == *"Up"* ]] && [[ "$NGINX_STATUS" == *"Up"* ]]; then
        print_success "✓ All containers are running!"
    else
        print_error "⚠ Some containers may not be running properly"
        print_info "Check logs with: docker compose logs"
    fi
    
    echo ""
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_info "Recent Application Logs:"
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker compose logs --tail=15 app 2>/dev/null || echo "No logs available yet"
    echo ""
    
    # Get hostname/IP for display
    HOSTNAME=$(hostname -I | awk '{print $1}')
    if [ -z "$HOSTNAME" ]; then
        HOSTNAME="localhost"
    fi
    
    echo ""
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_success "✓ Installation Complete!"
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    print_info "The app is now running with HTTPS!"
    print_info ""
    print_info "📍 Access URLs:"
    print_info "   • https://localhost"
    print_info "   • https://$HOSTNAME"
    echo ""
    print_info "⚠️  Security Note:"
    print_info "   You'll see a security warning because we're using a self-signed certificate."
    print_info "   This is normal for local/private networks."
    print_info "   Click 'Advanced' → 'Proceed to localhost (unsafe)' to continue."
    echo ""
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_info "Useful Commands:"
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_info "  View all logs:        docker compose logs -f"
    print_info "  View app logs:        docker compose logs -f app"
    print_info "  View nginx logs:      docker compose logs -f nginx"
    print_info "  Check status:         docker compose ps"
    print_info "  Stop app:             docker compose down"
    print_info "  Restart app:          docker compose restart"
    print_info "  Restart specific:     docker compose restart app"
    echo ""
}

# Main execution
main() {
    echo ""
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_info "Music Streamer Setup - Raspberry Pi"
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Step 1: Check architecture
    print_info "Step 1/5: Checking system architecture..."
    check_architecture
    echo ""
    
    # Step 2: Check and install Docker
    print_info "Step 2/5: Checking Docker installation..."
    if ! check_docker; then
        echo ""
        read -p "Docker is not installed. Do you want to install it? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo ""
            install_docker
            echo ""
            print_info "Please log out and back in, or run 'newgrp docker' for group changes to take effect."
            read -p "Press Enter after you've logged out/in or run 'newgrp docker'..."
        else
            print_error "Docker is required to continue. Exiting."
            exit 1
        fi
    fi
    
    # Verify Docker works
    if ! verify_docker; then
        print_error "Docker verification failed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! check_docker_compose; then
        print_error "Docker Compose is required but not found"
        exit 1
    fi
    echo ""
    
    # Step 3: Generate SSL certificates
    print_info "Step 3/5: Setting up SSL certificates..."
    generate_certificates
    echo ""
    
    # Step 4: Check .env file
    print_info "Step 4/5: Checking environment configuration..."
    ENV_EXISTS=true
    if ! check_env_file; then
        ENV_EXISTS=false
    fi
    
    if [ "$ENV_EXISTS" = false ]; then
        echo ""
        print_info "Please update .env file with your Sonos API credentials:"
        print_info "  - SONOS_CLIENT_ID"
        print_info "  - SONOS_CLIENT_SECRET"
        echo ""
        read -p "Press Enter after updating .env file to continue..."
        echo ""
    fi
    
    # Note: Database initialization is handled by Docker container entrypoint
    print_info "Database will be initialized automatically when the container starts"
    echo ""
    
    # Step 5: Build and start
    print_info "Step 5/5: Building and starting application..."
    start_app
    
    echo ""
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_success "✓ Setup completed successfully!"
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Run main function
main
