# Constellation

A visual infrastructure topology dashboard for homelab and cloud environments.

## Features

- **Visual Network Topology** - Interactive drag-and-drop canvas powered by React Flow
- **Dark/Light Mode** - Full theme support with persistent preferences
- **Service Management** - Add, edit, and organize services per host
- **Cross-Network Visualization** - Solid lines for same-network, dashed for cross-network
- **Ollama API Integration** - Built-in testing for Ollama endpoints
- **Docker Support** - Production-ready containerization with persistent data
- **Tailscale-Friendly** - Designed for distributed homelab setups

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Enan456/constellation.git
cd constellation

# Copy example data file
cp data/infrastructure.example.json data/infrastructure.json

# Start with Docker
docker compose up -d
```

The dashboard will be available at `http://localhost:3000`.

## Installation

### Prerequisites

- Node.js 20 or higher
- Docker and Docker Compose (for containerized deployment)

### Setup

```bash
git clone https://github.com/Enan456/constellation.git
cd constellation

# Copy example files
cp data/infrastructure.example.json data/infrastructure.json
cp .env.example .env  # Optional: customize settings

npm install
```

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Server port |
| `DATA_PATH` | `/app/data/infrastructure.json` | Path to data file |
| `APP_TITLE` | `Constellation` | Application title |

### Data File Setup

**Important**: The `data/infrastructure.json` file contains your network topology and is gitignored for security.

1. Copy the example file:
   ```bash
   cp data/infrastructure.example.json data/infrastructure.json
   ```

2. Edit with your actual infrastructure details (IPs, hostnames, services)

3. The data file is automatically loaded and saved by the application

### Data File Structure

- **locations** - Network zones (e.g., "Network A", "Cloud Services")
- **hosts** - Individual machines with IP addresses and positions
- **services** - Applications running on each host with ports and protocols
- **connections** - Links between hosts
- **settings** - Display preferences

## Docker Deployment

### Building and Running

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Docker Compose Configuration

```yaml
services:
  constellation:
    image: ghcr.io/enan456/constellation:latest
    container_name: constellation
    restart: unless-stopped
    ports:
      - "${PORT:-3000}:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
```

### Data Persistence

The `./data` directory is mounted to `/app/data` inside the container. Your infrastructure configuration persists across container restarts.

Backup:
```bash
cp -r ./data ./data-backup
```

## GitHub Actions CI/CD

Included workflows:

- **ci.yml** - Build and lint on PRs
- **docker-publish.yml** - Build and push Docker image to ghcr.io
- **deploy.yml** - Deploy to target server via Tailscale

### Required Secrets for Deployment

Set these in your GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `TS_OAUTH_CLIENT_ID` | Tailscale OAuth client ID |
| `TS_OAUTH_SECRET` | Tailscale OAuth secret |
| `DEPLOY_HOST` | Target server hostname/IP |
| `DEPLOY_USER` | SSH username for deployment |

## Tech Stack

- **Framework**: Next.js 16
- **UI**: React 19, Tailwind CSS 4
- **Flow Visualization**: React Flow
- **State Management**: Zustand
- **Validation**: Zod
- **Runtime**: Node.js 20

## Security Notes

- `data/infrastructure.json` is gitignored - never commit real infrastructure data
- Use `.env` for local configuration (also gitignored)
- All deployment secrets should be stored in GitHub Secrets
- Tailscale IPs and hostnames should only exist in your local data file

## License

MIT
