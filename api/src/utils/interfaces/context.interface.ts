import { Role } from "@utils/enums";
import { Request } from "express";

export interface ContextUser {
  id: number;
  role: Role;
}

export interface ContextType {
  req: Request;
  user?: ContextUser;
}

export interface ContextTypeUser {
  req: Request;
  user: ContextUser;
}
