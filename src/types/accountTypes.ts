import { Prisma } from '../generated/prisma';

export interface UserInfo
  extends Pick<
    Prisma.usersCreateInput,
    'user_id' | 'name' | 'timezone' | 'created_at'
  > {}

export interface UserStatus {
  subject_id: string;
  name: string;
  start_time: number;
}

//GET /account/:user_id/profile
export type GetAccountProfileParams = {
  user_id: string;
};

export type GetAccountProfileQuery = {
  timezone: string;
};
