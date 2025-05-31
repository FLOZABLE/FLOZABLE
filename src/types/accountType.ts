import { Prisma } from '../generated/prisma';

export interface UserInfo
  extends Pick<
    Prisma.usersCreateInput,
    'user_id' | 'name' | 'timezone' | 'created_at'
  > {}
