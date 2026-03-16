# SmartPlay 🎵

A scalable, production-style music streaming platform built as a Node.js monorepo. SmartPlay enables artists to upload music, admins to moderate content, and listeners to stream and discover tracks.

## Architecture

```
smartplay/
├── apps/
│   ├── web/                  # React frontend (listeners & artists) — port 5173
│   └── admin/                # React admin dashboard — port 5174
├── services/
│   ├── api-gateway/          # Express API gateway (auth, routing, rate-limiting) — port 3000
│   ├── auth-service/         # JWT authentication + bcrypt
│   ├── music-service/        # Song upload (multer), metadata (Mongoose)
│   ├── streaming-service/    # HTTP range-request audio streaming
│   └── analytics-service/    # Usage/stream tracking
├── database/
│   └── models/               # Shared Mongoose models (User, Song, Playlist, StreamLog)
├── infrastructure/
│   ├── docker/               # Dockerfiles + nginx config
│   └── kubernetes/           # Kubernetes manifests (WIP)
├── uploads/                  # Local audio file storage (configurable)
├── docker-compose.yml
└── .env.example
```

### Key design decisions

- **Monorepo with npm workspaces** — single `npm install` at the root installs all dependencies.
- **API Gateway pattern** — all client traffic enters at port 3000; the gateway handles auth validation, rate limiting, and routes to the correct service module.
- **JWT with role-based access** — roles: `admin`, `artist`, `listener`. Middleware enforces role requirements per route.
- **HTTP range requests** — the streaming endpoint parses `Range` headers and responds with `206 Partial Content` for seekable audio playback.
- **MongoDB + Mongoose** — shared models in `database/models/` used by all services.
- **Redis rate limiting** — `express-rate-limit` with `rate-limit-redis` store (falls back to in-memory if Redis is unavailable).

## Prerequisites

- Node.js 20+
- Docker + Docker Compose
- MongoDB 7 (or use docker-compose)
- Redis 7 (or use docker-compose)

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/KernelBornie/smartplay.git
cd smartplay
cp .env.example .env
# Edit .env and set JWT_SECRET, MONGO_URI, etc.
npm install
```

### 2. Start with Docker Compose (recommended)

```bash
docker-compose up
```

This starts:
- **MongoDB** on port 27017
- **Redis** on port 6379
- **API Gateway** on port 3000

Then in a separate terminal, start the frontend apps locally:

```bash
npm run dev:apps   # starts apps/web on :5173 and apps/admin on :5174
```

### 3. Start everything locally (no Docker)

Make sure MongoDB and Redis are running locally, then:

```bash
npm run dev
```

This uses `concurrently` to start all services and apps at once.

### 4. Run tests

```bash
npm test
```

## Environment variables

Copy `.env.example` to `.env` and configure:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | API gateway port |
| `NODE_ENV` | `development` | Environment |
| `MONGO_URI` | `mongodb://localhost:27017/smartplay` | MongoDB connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `JWT_SECRET` | *(required)* | Secret for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | JWT expiry |
| `UPLOAD_PATH` | `./uploads` | Local directory for audio files |
| `MAX_FILE_SIZE` | `52428800` (50 MB) | Max upload size in bytes |
| `CORS_ORIGIN` | `http://localhost:5173,...` | Allowed CORS origins (comma-separated) |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

## API Documentation

All endpoints are served through the API Gateway at `http://localhost:3000`.

### Authentication

#### `POST /auth/register`

Register a new user.

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "listener"
}
```

**Response 201:** `{ "token": "eyJ...", "user": { "id": "...", "username": "johndoe", "role": "listener" } }`

#### `POST /auth/login`

**Body:** `{ "email": "...", "password": "..." }`

---

### Songs

#### `GET /songs`

List approved songs. Query params: `page`, `limit`, `genre`, `search`

#### `GET /songs/:id`

Get a single approved song by ID.

#### `POST /songs/upload` *(artist or admin)*

Upload an audio file as `multipart/form-data`.

Fields: `file` (audio), `title` (required), `genre`, `album`, `duration`

---

### Streaming

#### `GET /stream/:songId`

Stream an approved audio file with HTTP range request support.
- With `Range` header → `206 Partial Content`
- Without `Range` header → `200 OK` (full file)

---

### Admin *(admin role required)*

| Endpoint | Description |
|---|---|
| `POST /admin/approve-song` | Approve a song `{ songId }` |
| `POST /admin/reject-song` | Reject a song `{ songId }` |
| `DELETE /admin/songs/:id` | Delete a song |
| `GET /admin/songs` | List all songs (filterable by `?status=pending`) |
| `POST /admin/ban-user` | Ban a user `{ userId }` |
| `GET /admin/users` | List all users |

---

### Analytics *(admin role required)*

| Endpoint | Description |
|---|---|
| `GET /analytics/streams` | Paginated stream log entries |
| `GET /analytics/top-songs` | Top songs by play count |
| `GET /analytics/summary` | Dashboard totals |

---

## Docker Deployment

```bash
docker-compose up --build -d
docker-compose logs -f api-gateway
docker-compose down
```

Volumes: `smartplay_mongo`, `smartplay_redis`, `smartplay_uploads`

## Frontend Apps

### `apps/web` — Listener/Artist UI (port 5173)

Routes: `/`, `/library`, `/player/:id`, `/upload`, `/login`, `/register`

### `apps/admin` — Admin Dashboard (port 5174)

Routes: `/admin/dashboard`, `/admin/songs`, `/admin/users`, `/admin/analytics`

## Development scripts

| Command | Description |
|---|---|
| `npm run dev` | Start all services and apps concurrently |
| `npm run dev:services` | Start only backend services |
| `npm run dev:apps` | Start only frontend apps |
| `npm run build` | Build all workspaces |
| `npm test` | Run all tests |

## Creating an admin user

Register normally then update the role in MongoDB:

```bash
mongosh smartplay --eval 'db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })'
```

## License

MIT
