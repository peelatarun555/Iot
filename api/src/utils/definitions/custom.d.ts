import User from "@resources/user/user.schema";

declare global {
  namespace Express {
    export interface Request {
      startTime: [number, number];
      loggingObject: { [key: string]: any };
      user?: User;
    }
  }
}
