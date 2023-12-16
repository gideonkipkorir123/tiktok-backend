/* eslint-disable prettier/prettier */
declare namespace Express {
  export interface Request {
    user?: {
      username: string;
      sub: string;
    };
  }
}
