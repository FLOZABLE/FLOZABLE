/* import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user_id?: string;
  }
}
export {};
 */

export {}

declare global {
  namespace Express {
    export interface Request {
      user_id?: string;
    }
  }
}