# Music Streamer

A beautiful, modern music streaming interface for Sonos systems, designed for wall-mounted tablets and desk displays.

## Features

- 🎵 Control Sonos speakers and zones
- 🎨 Beautiful, modern UI optimized for touch screens
- 🌓 Light and dark mode support
- 📱 Responsive design for 1280×800 displays
- 🔊 Multi-zone audio control
- 🔀 Shuffle and repeat modes
- 💾 Persistent preferences and zone selection

## Requirements

- Raspberry Pi 4 with Pi OS 64-bit
- Docker and Docker Compose
- Sonos account with API credentials

## Quick Start on Raspberry Pi

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ollieCookQuest/musicStreamer.git
   cd musicStreamer
   ```

2. **Run the setup script:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

   The script will:
   - Check if running on ARM64 architecture (Raspberry Pi 4)
   - Check if Docker is installed (install if needed)
   - Verify Docker Compose is available
   - Create a `.env` file template if it doesn't exist
   - Build and start the application using Docker Compose

3. **Configure your `.env` file:**
   
   Edit `.env` and add your Sonos API credentials:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   SONOS_CLIENT_ID=your_sonos_client_id
   SONOS_CLIENT_SECRET=your_sonos_client_secret
   SONOS_CALLBACK_URL=https://your-domain.com/api/sonos/callback
   ```
   
   **Note:** For local development/testing, you can use `https://lvh.me:3000/api/sonos/callback` as the callback URL.

4. **Access the application:**
   
   Open your browser and navigate to `https://localhost` or `https://<raspberry-pi-ip>`
   
   **Note:** The setup script automatically generates SSL certificates for HTTPS. You'll see a security warning because it's a self-signed certificate - this is normal for local/private networks. Click "Advanced" and "Proceed" to continue.
   
   The database will be automatically initialized on first container start.

## Manual Setup

If you prefer to set up manually:

### Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Log out and log back in for group changes to take effect.

### Build and Run

```bash
docker compose build
docker compose up -d
```

## Docker Commands

- **View logs:** `docker compose logs -f`
- **Stop the app:** `docker compose down`
- **Restart the app:** `docker compose restart`
- **Rebuild:** `docker compose build --no-cache`

## Development

For local development:

```bash
npm install
npm run dev
```

## Architecture

- **Frontend:** Next.js 16 with React 19
- **Styling:** Tailwind CSS v4
- **Database:** SQLite with Prisma ORM
- **API:** Sonos Control API

## Device Support

The app supports two device configurations:
- **TheWall:** Wall-mounted 10.1" display (1280×800)
- **TheDesk:** Desk-mounted 10.1" display (1280×800)

## License

Private project
