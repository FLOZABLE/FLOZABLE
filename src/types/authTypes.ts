import { Request } from 'express';

export type SignupRequestBody = {
  name: string;
  email: string;
  timezone: string;
  password: string;
};

export type LoginRequestBody = {
  email: string;
  password: string;
};


declare module 'express-serve-static-core' {
  interface Request {
    user_id?: string;
  }
}