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
