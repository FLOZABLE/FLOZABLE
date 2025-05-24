import crypto from 'crypto';
import bcrypt from 'bcrypt';

export function hashing(password: string) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return [salt, hash];
}

export async function bcryptHash(password: string) {
  const saltRounds = 12; // or 10–12 is fine
  return await bcrypt.hash(password, saltRounds);
}

export async function bcryptVerify(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export function nowSec() {
  return Math.floor(Date.now() / 1000);
}
