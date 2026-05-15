

# 🎵 SmartPlay

**A scalable, production‑ready music streaming platform** built as a Node.js monorepo.  
SmartPlay enables **artists** to upload and monetise music, **listeners** to stream and discover tracks, and **admins** to control the entire platform from a real‑time CEO dashboard.

---

## Architecture

```
smartplay/
├── apps/
│   ├── web/                  # React frontend (listeners & artists) – port 5173
│   └── admin/                # React admin dashboard – port 5174
├── services/
│   ├── api-gateway/          # Express API gateway (auth, routing, rate‑limiting) – port 3000
│   ├── auth-service/         # JWT authentication, profile, plans, password reset – port 3001
│   ├── music-service/        # Song upload (multer), metadata, streaming, downloads – port 3002
│   ├── streaming-service/    # HTTP range‑request audio streaming – port 3003
│   └── analytics-service/    # Stream & download analytics – port 3004
├── database/
│   └── models/               # Mongoose schemas (User, Song, StreamLog, Plan)
├── packages/
│   └── shared/               # Shared utilities, middleware, logging, DB connection
├── uploads/                  # Audio files, covers, profile pictures
├── apps/web/public/backgrounds/  # Motion background images
├── docker-compose.yml
├── .env.example
└── package.json              # Workspace root (npm workspaces)
```

**Key design choices:**
- **API Gateway pattern** – all client traffic enters at port 3000; the gateway authenticates, rate‑limits, and proxies to internal services.
- **JWT authentication** with role‑based access (admin, artist, listener).
- **HTTP range requests** for seekable audio streaming (206 Partial Content).
- **MongoDB + Mongoose** – shared models used by all services.
- **Express‑rate‑limit** for API protection.
- **Framer Motion** – smooth animations, motion backgrounds, and interactive UI.
- **Session‑based multi‑user isolation** (each browser tab has independent JWT storage).

---

## Features

### 🎧 Listeners
- Home page with **hero**, trending, mood‑based music, Zambia Top 50 charts
- Library with **cover art**, play/pause streaming, and **downloads**
- Sticky bottom player with real‑time play tracking
- Personalised dashboard: recent plays, current plan
- Profile management: picture, bio, DOB, website, social links
- Password reset flow (forgot password / reset token)

### 🎤 Artists
- Everything a listener can do, plus:
- **Upload songs** with audio file + optional cover image
- Artist dashboard: total plays, earnings, pending songs, my songs list
- Monetisation: **$0.004/stream**, **$0.50/download**
- Songs require admin approval before going public

### 🛡 Admin / CEO Dashboard
- **KPI cards** – total users, approved songs, pending songs, streams, downloads, revenue
- **Top 5 artists** by stream count
- **Genre breakdown** (songs + plays)
- **Live activity feed** – recent streams/downloads
- Song management: approve, reject, delete
- User management: edit role, freeze/unfreeze, view earnings
- Full admin panel on separate frontend (port 5174)

### 🎨 Visual & UX
- **Motion backgrounds** – rotating custom images on all dashboards
- Smooth animations with **Framer Motion**
- Dark, Spotify‑like theme
- Cover art on songs, trending cards, charts, and player
- Role‑filtered dashboards (data never leaks between users)

---

## Prerequisites

- **Node.js 20+** (and npm)
- **MongoDB 7** (running locally or via Docker)
- **Redis** (optional – falls back to in‑memory rate limiting)
- **Docker** (optional, for containerised deployment)

---

## Quick Start (Local)

```bash
# 1. Clone the repository
git clone https://github.com/KernelBornie/smartplay.git
cd smartplay

# 2. Copy environment file and edit
cp .env.example .env
# Set JWT_SECRET, MONGO_URI, etc.

# 3. Install all dependencies (monorepo)
npm install

# 4. Start MongoDB
net start MongoDB          # Windows service
# OR
mongod --dbpath C:\data\db

# 5. Start the whole platform
npm run dev
```

The API Gateway starts on port **3000**, the web frontend on **5173**, and the admin panel on **5174**.

Open `http://localhost:5173` in your browser.  
To create an admin user, register normally, then set the role in MongoDB:

```bash
mongosh smartplay --eval 'db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })'
```

---

## Environment Variables (`{.env}`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | API gateway port |
| `AUTH_PORT` | 3001 | Auth service port |
| `MUSIC_PORT` | 3002 | Music service port |
| `STREAM_PORT` | 3003 | Streaming service port |
| `ANALYTICS_PORT` | 3004 | Analytics service port |
| `NODE_ENV` | development | Environment |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/smartplay` | MongoDB connection string |
| `JWT_SECRET` | (required) | Secret for JWT signing |
| `JWT_EXPIRES_IN` | 7d | JWT expiry |
| `UPLOAD_PATH` | `./uploads` | Local audio file storage |
| `MAX_FILE_SIZE` | 52428800 (50 MB) | Max upload size |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origins |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | 100 | Max requests per window |
| `AUTH_RATE_LIMIT_MAX` | 20 | Max auth requests per window |
| `LOG_LEVEL` | info | Logging level |

---

## API Documentation

All endpoints are served through the API Gateway at `http://localhost:3000`.

### Authentication

**POST /auth/register**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "listener"          // listener, artist, admin
}
```
Response: `{ "success": true, "data": { "token": "...", "user": {...} } }`

**POST /auth/login**
```json
{ "email": "...", "password": "..." }
```

**POST /auth/forgot‑password**
```json
{ "email": "..." }
```
Response (dev): returns a reset token.

**POST /auth/reset‑password**
```json
{ "token": "...", "newPassword": "..." }
```

### Songs (all require `Authorization: Bearer <token>` where noted)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/music/songs` | no | List approved songs (`?page=1&limit=20&genre=afro`) |
| GET | `/api/music/songs/:id` | no | Get song by ID |
| POST | `/api/music/songs/upload` | artist/admin | Upload a song (multipart: `file` + optional `cover`) |
| GET | `/api/music/songs/stream/:id` | no | Stream audio (206 Partial Content) |
| GET | `/api/music/songs/download/:id` | no | Download audio file |
| GET | `/api/music/songs/trending` | no | Trending songs (sorted by plays) |
| GET | `/api/music/songs/charts` | no | Top 50 by plays |
| GET | `/api/music/songs/search` | no | Search (`?q=artist+title+genre`) |

### Admin (admin role required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Role‑filtered dashboard (aggregated stats for admin) |
| GET | `/admin/stats` | Quick overview (users, songs, plays) |
| GET | `/admin/songs?status=pending` | List songs by status |
| POST | `/admin/approve-song` | Approve a song `{ "songId": "..." }` |
| POST | `/admin/reject-song` | Reject a song |
| DELETE | `/admin/songs/:id` | Delete a song |
| GET | `/admin/users` | List all users |
| PUT | `/admin/users/:id` | Edit user (role, freeze, plan) |
| POST | `/admin/users/:id/freeze` | Toggle user freeze |

### Profile & Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/profile` | Get current user profile (with plan) |
| PUT | `/auth/profile` | Update profile (username, bio, DOB, website) |
| POST | `/auth/profile/picture` | Upload profile picture (multipart `picture`) |
| GET | `/auth/plans` | List subscription plans |
| POST | `/auth/subscribe` | Subscribe to a plan `{ "planId": "..." }` |

---

## User Roles

| Role | Abilities |
|------|-----------|
| **listener** | Browse library, stream, download, like songs, manage profile, upgrade plan |
| **artist** | All listener features + upload songs, view artist dashboard with earnings/plays, manage social links |
| **admin** | Full platform control: CEO dashboard, approve/reject songs, manage users, freeze accounts, view all analytics |

Each user is isolated via JWT – no data leaks between accounts.

---

## Deployment (Public Access)

The app is fully functional behind any tunnelling service. We recommend **SSH tunnels (localhost.run)** for permanent, free URLs without account required.

### Steps to go live

1. Start the backend: `npm run dev`
2. Start the API tunnel:  
   `ssh -R 80:localhost:3000 nokey@localhost.run`
3. Start the frontend tunnel:  
   `ssh -R 80:localhost:5173 nokey@localhost.run`
4. Update `apps/web/src/config.js` and `apps/admin/src/config.js` with the API tunnel URL (the one from step 2).
5. Open the frontend tunnel URL on any device.

Optional admin tunnel: `ssh -R 80:localhost:5174 nokey@localhost.run`

The same approach works with **ngrok**, **Cloudflare Tunnel**, or any reverse proxy. The `allowedHosts` in Vite has already been set to `['all']` to accept any host.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services + both frontends concurrently |
| `npm run dev:services` | Start only backend services |
| `npm run dev:apps` | Start only frontend apps |
| `npm run build` | Build all workspaces for production |
| `npm test` | Run tests (Jest) |

---

## Tech Stack

- **Frontend:** React, React Router, Axios, Framer Motion, Vite
- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, express‑rate‑limit, helmet, cors
- **Database:** MongoDB
- **Streaming:** HTTP range requests (206 Partial Content)
- **Storage:** Local filesystem (`uploads/` folder)
- **Monorepo:** npm workspaces

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and open a Pull Request

For major changes, please discuss in an issue first.

---

## License

MIT – see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

Built with ❤️ by **Bornface Kangombe** and the open‑source community.  
Designed for Zambia and Africa, scalable to the world.

---
