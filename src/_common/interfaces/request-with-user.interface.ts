import { Request } from 'express';

/** JWT strategy validate() qaytardığı obyekt (req.user). */
export interface JwtUserPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
}

/** Express Request + Passport/JWT ilə doldurulan user. */
export type RequestWithUser = Request & { user?: JwtUserPayload };
