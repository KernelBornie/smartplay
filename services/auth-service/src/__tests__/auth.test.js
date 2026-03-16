/**
 * Auth service unit tests — validates JWT generation and bcrypt hashing logic.
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test-secret';

describe('JWT', () => {
  it('generates and verifies a valid token', () => {
    const payload = { userId: '123', role: 'listener', username: 'alice' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe('123');
    expect(decoded.role).toBe('listener');
  });

  it('rejects a token with wrong secret', () => {
    const token = jwt.sign({ userId: '1' }, 'wrong-secret');
    expect(() => jwt.verify(token, 'test-secret')).toThrow();
  });

  it('rejects an expired token', async () => {
    const token = jwt.sign({ userId: '1' }, process.env.JWT_SECRET, { expiresIn: 0 });
    await new Promise((res) => setTimeout(res, 10));
    expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow(/expired/i);
  });
});

describe('bcrypt', () => {
  it('hashes and verifies a password', async () => {
    const password = 'MySecret123!';
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);
    const valid = await bcrypt.compare(password, hash);
    expect(valid).toBe(true);
  });

  it('rejects wrong password', async () => {
    const hash = await bcrypt.hash('correct-password', 10);
    const valid = await bcrypt.compare('wrong-password', hash);
    expect(valid).toBe(false);
  });
});
