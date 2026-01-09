#!/bin/bash

# Generate self-signed SSL certificate for HTTPS

set -e

echo "🔐 Generating SSL certificates for HTTPS..."

# Create certs directory if it doesn't exist
mkdir -p certs

# Get hostname/IP for certificate
HOSTNAME=$(hostname -I | awk '{print $1}')
if [ -z "$HOSTNAME" ]; then
    HOSTNAME="localhost"
fi

echo "📋 Certificate will be valid for: localhost, $HOSTNAME"

# Generate self-signed certificate
if openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout certs/server.key \
    -out certs/server.crt \
    -subj "/C=US/ST=State/L=City/O=MusicStreamer/CN=$HOSTNAME" \
    -addext "subjectAltName=IP:$HOSTNAME,DNS:localhost,DNS:$HOSTNAME" 2>/dev/null; then
    echo "✅ Certificate generated with Subject Alternative Names"
else
    # Fallback for older OpenSSL versions
    echo "⚠️  Using basic certificate generation (older OpenSSL)"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout certs/server.key \
        -out certs/server.crt \
        -subj "/C=US/ST=State/L=City/O=MusicStreamer/CN=$HOSTNAME" 2>/dev/null
fi

# Set proper permissions
chmod 600 certs/server.key
chmod 644 certs/server.crt

echo ""
echo "✅ SSL certificates generated successfully!"
echo "   Certificate: certs/server.crt"
echo "   Private key: certs/server.key"
echo "   Valid for: localhost, $HOSTNAME"
echo ""
echo "⚠️  Note: This is a self-signed certificate."
echo "   Your browser will show a security warning - this is normal for local/private networks."
echo "   Click 'Advanced' → 'Proceed to localhost (unsafe)' to continue."
