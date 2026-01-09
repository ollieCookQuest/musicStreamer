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

- Node.js 20 or higher
- npm or yarn
- Sonos account with API credentials

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ollieCookQuest/musicStreamer.git
   cd musicStreamer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   SONOS_CLIENT_ID=your_sonos_client_id
   SONOS_CLIENT_SECRET=your_sonos_client_secret
   SONOS_CALLBACK_URL=https://your-domain.com/api/sonos/callback
   ```
   
   **Note:** For local development/testing, you can use `https://lvh.me:3000/api/sonos/callback` as the callback URL.

4. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   
   Open your browser and navigate to `http://localhost:3000`

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
