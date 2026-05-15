const COLLECTIONS = {
  USERS: 'users',
  SONGS: 'songs',
  PLAYLISTS: 'playlists',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics',
  STREAMS: 'streams'
};

const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  ARTIST: 'artist',
  LISTENER: 'listener'
};

const GENRES = [
  'rock', 'pop', 'jazz', 'classical', 'hip-hop',
  'electronic', 'r&b', 'country', 'metal', 'folk',
  'indie', 'latin', 'reggae', 'blues', 'punk'
];

const UPLOAD_LIMITS = {
  MAX_FILE_SIZE_MB: 50,
  ALLOWED_FORMATS: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
  MAX_SONGS_PER_USER: 100,
  MAX_PLAYLIST_SIZE: 500
};

const SONG_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  PARTIAL_CONTENT: 206,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

module.exports = {
  COLLECTIONS,
  ROLES,
  GENRES,
  UPLOAD_LIMITS,
  SONG_STATUS,
  HTTP_STATUS
};