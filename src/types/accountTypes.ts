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

export interface UserActiveGroup {
  group_id: string;
  name: string;
  time: number;
}

export type GetAccountProfileQuery = {
  timezone: string;
};

//PATCH /account/info
export type PatchAccountInfoBody = {
  name: string;
  email: string;
};

//PATCH /account/password
export type PatchAccountPasswordBody = {
  password: string;
};
