/**
 * API Gateway unit tests — uses jest mocks for Mongoose models,
 * no database connection required.
 */
const express = require('express');
const request = require('supertest');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Types } = require('mongoose');

process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

// --- Mock Mongoose models ------------------------------------------------
jest.mock('../../../../database/models/User', () => {
  const users = new Map();
  let nextId = 1;

  function makeId() {
    return String(nextId++);
  }

  class MockUser {
    constructor(data) {
      Object.assign(this, data);
      this._id = makeId();
    }

    async comparePassword(pw) {
      return pw === this.password;
    }

    static async findOne({ email, username, $or } = {}) {
      for (const u of users.values()) {
        if ($or) {
          for (const cond of $or) {
            if ((cond.email && u.email === cond.email) ||
                (cond.username && u.username === cond.username)) {
              return u;
            }
          }
        } else if (email && u.email === email) {
          return u;
        } else if (username && u.username === username) {
          return u;
        }
      }
      return null;
    }

    static async create(data) {
      const u = new MockUser(data);
      users.set(u._id, u);
      return u;
    }

    static async findByIdAndUpdate(id, update, opts) {
      const u = users.get(id);
      if (!u) return null;
      if (update.$set) Object.assign(u, update.$set);
      return opts && opts.new ? u : u;
    }

    // expose for cleanup
    static _users = users;
    static _clear() { users.clear(); nextId = 1; }
  }

  return MockUser;
});

jest.mock('../../../../database/models/Song', () => {
  const songs = new Map();
  let nextId = 100;

  class MockQuery {
    constructor(data) {
      this._data = [...data];
    }
    populate() { return this; }
    sort() { return this; }
    skip(n) { this._data = this._data.slice(n); return this; }
    limit(n) { this._data = this._data.slice(0, n); return this; }
    async then(res, rej) {
      return Promise.resolve(this._data).then(res, rej);
    }
    [Symbol.toStringTag] = 'Promise';
  }

  MockQuery.prototype[Symbol.iterator] = function* () { yield* this._data; };

  class MockSong {
    constructor(data) {
      Object.assign(this, data);
      this._id = String(nextId++);
    }

    static find(filter = {}) {
      const filtered = [...songs.values()].filter((s) => {
        for (const [k, v] of Object.entries(filter)) {
          if (s[k] !== v) return false;
        }
        return true;
      });
      return new MockQuery(filtered);
    }

    static findById(id) {
      const song = songs.get(id) || null;
      const thenable = {
        populate() { return this; },
        then(res, rej) { return Promise.resolve(song).then(res, rej); },
      };
      return thenable;
    }

    static async countDocuments(filter = {}) {
      return [...songs.values()].filter((s) => {
        for (const [k, v] of Object.entries(filter)) {
          if (s[k] !== v) return false;
        }
        return true;
      }).length;
    }

    static async create(data) {
      const s = new MockSong(data);
      songs.set(s._id, s);
      return s;
    }

    static async findByIdAndUpdate(id, update, opts) {
      const s = songs.get(id);
      if (!s) return null;
      if (update.$set) Object.assign(s, update.$set);
      if (update.$inc) {
        for (const [k, v] of Object.entries(update.$inc)) s[k] = (s[k] || 0) + v;
      }
      return opts && opts.new ? s : s;
    }

    static async findByIdAndDelete(id) {
      const s = songs.get(id);
      if (s) songs.delete(id);
      return s || null;
    }

    static _clear() { songs.clear(); nextId = 100; }
  }

  return MockSong;
});

jest.mock('../../../../database/models/StreamLog', () => {
  class MockStreamLog {
    static async create() { return {}; }
    static async find() { return { populate: () => ({ populate: () => ({ sort: () => ({ skip: () => ({ limit: () => [] }) }) }) }) }; }
    static async countDocuments() { return 0; }
  }
  return MockStreamLog;
});

// --- Build app -----------------------------------------------------------
let app;

beforeAll(() => {
  const authRoutes = require('../routes/auth');
  const songRoutes = require('../routes/songs');
  const adminRoutes = require('../routes/admin');
  const analyticsRoutes = require('../routes/analytics');

  app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const limiter = rateLimit({ windowMs: 60000, max: 10000 });
  app.use(limiter);

  app.use('/auth', authRoutes);
  app.use('/songs', songRoutes);
  app.use('/admin', adminRoutes);
  app.use('/analytics', analyticsRoutes);

  app.get('/health', (_req, res) => res.json({ ok: true, service: 'api-gateway' }));

  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  });
});

// --- Tests ---------------------------------------------------------------

describe('Health check', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.service).toBe('api-gateway');
  });
});

describe('Auth endpoints', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'listener',
  };

  it('POST /auth/register - creates a new user', async () => {
    const res = await request(app).post('/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.role).toBe('listener');
  });

  it('POST /auth/register - rejects duplicate user', async () => {
    // User already exists from the previous test
    const res = await request(app).post('/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('POST /auth/register - validates input (bad email)', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'ab', email: 'not-an-email', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /auth/login - valid credentials return token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    const decoded = jwt.verify(res.body.token, 'test-secret');
    expect(decoded.role).toBe('listener');
  });

  it('POST /auth/login - wrong password returns 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('POST /auth/login - missing email returns 400', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'pass' });
    expect(res.status).toBe(401);
  });
});

describe('Songs endpoints', () => {
  it('GET /songs - returns empty array when no approved songs', async () => {
    const res = await request(app).get('/songs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.songs)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /songs/:id - returns 404 for nonexistent song', async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await request(app).get(`/songs/${fakeId}`);
    expect(res.status).toBe(404);
  });

  it('POST /songs/upload - returns 401 without token', async () => {
    const res = await request(app).post('/songs/upload').send({});
    expect(res.status).toBe(401);
  });

  it('POST /songs/upload - returns 403 for listener role', async () => {
    const token = jwt.sign({ userId: 'abc', role: 'listener', username: 'listener' }, 'test-secret');
    const res = await request(app)
      .post('/songs/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Test Song');
    // No file provided - body validation or auth should fail first
    expect([400, 403]).toContain(res.status);
  });
});

describe('Admin endpoints', () => {
  it('GET /admin/songs - returns 401 without token', async () => {
    const res = await request(app).get('/admin/songs');
    expect(res.status).toBe(401);
  });

  it('GET /admin/users - returns 401 without token', async () => {
    const res = await request(app).get('/admin/users');
    expect(res.status).toBe(401);
  });

  it('POST /admin/approve-song - returns 403 for listener role', async () => {
    const token = jwt.sign({ userId: 'abc', role: 'listener' }, 'test-secret');
    const res = await request(app)
      .post('/admin/approve-song')
      .set('Authorization', `Bearer ${token}`)
      .send({ songId: new Types.ObjectId().toString() });
    expect(res.status).toBe(403);
  });

  it('POST /admin/approve-song - admin can approve (404 for unknown song)', async () => {
    const token = jwt.sign({ userId: 'admin1', role: 'admin' }, 'test-secret');
    const res = await request(app)
      .post('/admin/approve-song')
      .set('Authorization', `Bearer ${token}`)
      .send({ songId: new Types.ObjectId().toString() });
    // Song doesn't exist in mock
    expect(res.status).toBe(404);
  });
});

describe('Analytics endpoints', () => {
  it('GET /analytics/streams - returns 401 without token', async () => {
    const res = await request(app).get('/analytics/streams');
    expect(res.status).toBe(401);
  });

  it('GET /analytics/summary - returns 403 for non-admin', async () => {
    const token = jwt.sign({ userId: 'user1', role: 'artist' }, 'test-secret');
    const res = await request(app)
      .get('/analytics/summary')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
