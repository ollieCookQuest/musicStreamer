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
    
    # Update package index
    sudo apt-get update
    
    # Install prerequisites
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up the repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add current user to docker group (requires logout/login to take effect)
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully"
    print_info "Note: You may need to log out and log back in for Docker group permissions to take effect"
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
    
    # Get hostname/IP for certificate
    HOSTNAME=$(hostname -I | awk '{print $1}')
    if [ -z "$HOSTNAME" ]; then
        HOSTNAME="localhost"
    fi
    
    # Generate self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout certs/server.key \
        -out certs/server.crt \
        -subj "/C=US/ST=State/L=City/O=MusicStreamer/CN=$HOSTNAME" \
        -addext "subjectAltName=IP:$HOSTNAME,DNS:localhost,DNS:$HOSTNAME" 2>/dev/null || \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout certs/server.key \
        -out certs/server.crt \
        -subj "/C=US/ST=State/L=City/O=MusicStreamer/CN=$HOSTNAME"
    
    # Set permissions
    chmod 600 certs/server.key
    chmod 644 certs/server.crt
    
    print_success "SSL certificates generated in certs/ directory"
    print_info "Certificate is valid for: localhost, $HOSTNAME"
    print_info "Note: This is a self-signed certificate. Your browser will show a security warning."
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
    print_info "Building Docker image (this may take a few minutes)..."
    docker compose build
    
    print_info "Starting containers..."
    docker compose up -d
    
    print_success "Application started!"
    echo ""
    
    # Get hostname/IP for display
    HOSTNAME=$(hostname -I | awk '{print $1}')
    if [ -z "$HOSTNAME" ]; then
        HOSTNAME="localhost"
    fi
    
    print_info "The app is now running with HTTPS!"
    print_info "Access at: https://localhost or https://$HOSTNAME"
    print_info ""
    print_info "Note: You'll see a security warning because we're using a self-signed certificate."
    print_info "This is normal for local/private networks. Click 'Advanced' and 'Proceed' to continue."
    print_info ""
    print_info "Useful commands:"
    print_info "  View logs: docker compose logs -f"
    print_info "  Stop app: docker compose down"
    print_info "  Restart: docker compose restart"
}

# Main execution
main() {
    echo "Starting setup process..."
    echo ""
    
    # Check architecture
    check_architecture
    
    # Check and install Docker
    if ! check_docker; then
        read -p "Docker is not installed. Do you want to install it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_docker
            print_info "Please log out and log back in, then run this script again to continue"
            exit 0
        else
            print_error "Docker is required to run this application"
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
    
    # Generate SSL certificates
    generate_certificates
    
    # Check .env file
    ENV_EXISTS=true
    if ! check_env_file; then
        ENV_EXISTS=false
    fi
    
    if [ "$ENV_EXISTS" = false ]; then
        read -p "Please update .env file with your credentials, then press Enter to continue..."
    fi
    
    # Note: Database initialization is handled by Docker container entrypoint
    print_info "Database will be initialized automatically when the container starts"
    
    # Start the application
    start_app
    
    echo ""
    print_success "Setup complete! 🎉"
}

# Run main function
main
