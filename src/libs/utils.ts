import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { DateTime } from 'luxon';

import { Viewer } from '../types/otherTypes';

export function hashing(password: string) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return [salt, hash];
}

export async function bcryptHash(password: string) {
  const saltRounds = 12; // or 10–12 is fine
  return await bcrypt.hash(password, saltRounds);
}

export async function bcryptVerify(
  password: string | undefined | null,
  hash: string | undefined | null,
) {
  if (!password || !hash) return false;
  return await bcrypt.compare(password, hash);
}

export function nowSec() {
  return Math.floor(Date.now() / 1000);
}

interface GetDatesParams {
  date: string;
  viewer: Viewer;
  length: number;
  timezone: string;
}

export function getDates({
  date,
  viewer,
  length,
  timezone,
}: GetDatesParams): DateTime[] {
  const dates: DateTime[] = [];
  let dateTime = DateTime.fromISO(date, { zone: timezone })
    .startOf(viewer)
    .startOf('day');
  const now = DateTime.now().setZone(timezone).startOf(viewer).startOf('day');

  for (let i = 0; i < length; i++) {
    if (dateTime.plus({ [viewer]: i }) <= now) {
      dates.push(dateTime.plus({ [viewer]: i }));
    }
  }
  while (dates.length < length) {
    dateTime = dateTime.minus({ [viewer]: 1 });
    dates.unshift(dateTime);
  }

  return dates;
}
