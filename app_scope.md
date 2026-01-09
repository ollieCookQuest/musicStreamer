# Music Streamer Web App - Scope Document

## Overview
A high-performance, aesthetically pleasing music streaming dashboard designed for home audio enthusiasts. The application focuses on a "Lean Back" experience, allowing users to control their entire home's audio ecosystem (starting with Sonos) through a unified, responsive interface that feels like a native app.

## Phase 1: Sonos Ecosystem Focus
The MVP will focus on deep integration with the Sonos Control API. 
- **Goal**: Full parity with basic Sonos app controls but with a superior, customizable UI.
- **Scope**: Support for Groups (Zones), Volume, Playback, and Library browsing.

## User Stories
1. **As a first-time user**, I want to connect my Sonos account easily so I can see my speakers immediately.
2. **As a home user**, I want to see what's playing in every room at a glance without switching tabs.
3. **As a listener**, I want to browse my Sonos favorites and playlists with high-resolution artwork.
4. **As a host**, I want to quickly group speakers together for a "Party Mode" and adjust their relative volumes.

## App Flow & Navigation

### 1. Onboarding & OAuth
- **Detect Configuration**: App checks for valid Sonos OAuth tokens in SQLite.
- **Redirect**: If missing, redirect to a `/setup` page.
- **Handshake**: Users are directed to Sonos' secure login, then returned to the app with credentials.

### 2. The "Dashboard" (My Music)
- **Grid Layout**: Responsive grid showing favorite albums and playlists.
- **Now Playing Bar**: A persistent mini-player at the bottom showing current track/room.
- **Zone Selector**: A sidebar or drawer to switch between "Kitchen," "Living Room," etc.

### 3. The "Stage" (Full-Screen Player)
- **Immersive UI**: Dynamic background colors extracted from album art (Glassmorphism effect).
- **Advanced Controls**: 
  - Cross-room volume syncing.
  - Queue management (View/Rearrange).
  - High-res artwork viewer.

## Technical Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router) for Server-Side Rendering of music metadata.
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion for smooth transitions.
- **Database**: Prisma + SQLite (Local storage for tokens, user preferences, and cached metadata).
- **State Management**: React Context or Zustand for real-time playback synchronization.
- **Real-time**: Sonos Webhooks for instant status updates (volume changes, track skips).

### Proposed Data Model (Prisma)
- `Account`: Stores OAuth tokens, refresh tokens, and service type (Sonos).
- `Zone`: Local cache of speaker groups and their last known states.
- `Preference`: User settings like "Dark Mode," "Default Room," and "UI Density."

## Features

### Core Implementation
- **OAuth2 Flow**: Secure token exchange and automatic refreshing.
- **Library Proxy**: Middleware to fetch and cache Sonos metadata to avoid API rate limits.
- **Adaptive UI**: Specialized layouts for mobile (touch-optimized) and desktop (mouse/keyboard).

### Future Roadmap
- **Multi-Service**: Integration with Spotify Connect, Tidal, and local Plex libraries.
- **Smart Automations**: "Morning Scene" (start jazz in the kitchen at 8 AM).
- **Waveform Visualizers**: Real-time audio visualization in the full-screen player.

## Non-Functional Requirements
- **Performance**: < 200ms latency for playback commands.
- **Aesthetics**: Support for native-like animations and haptic feedback on mobile.
- **Accessibility**: WCAG 2.1 compliance for color contrast and screen readers.
- **Offline Resilience**: Graceful error handling when speakers are unreachable.