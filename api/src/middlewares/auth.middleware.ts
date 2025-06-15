// auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Permission, Role } from "@utils/enums";
import { env } from "@utils/env";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        permissions: Permission[];
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  try {
    const secret = env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const decoded = jwt.verify(token, secret) as JwtPayload & {
      sub: string;
      role: Role;
      permissions: Permission[];
    };

    if (!decoded.sub || !Object.values(Role).includes(decoded.role)) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role,
      permissions: decoded.permissions?.filter(p =>
        Object.values(Permission).includes(p)
      ) || [],
    };

    return next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (requiredRole: Role) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.role || !hasRoleAccess(req.user.role, requiredRole)) {
    return res.status(403).json({ 
      message: `Requires ${requiredRole} role or higher` 
    });
  }
  return next();
};

export const requirePermission = (requiredPermission: Permission) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const hasAccess = req.user?.permissions?.some(p =>
    hasPermissionAccess(p, requiredPermission)
  );
  if (!hasAccess) {
    return res.status(403).json({ 
      message: `Requires ${requiredPermission} permission` 
    });
  }
  return next();
};

// Helpers
export function hasRoleAccess(userRole: Role, requiredRole: Role): boolean {
  const hierarchy = {
    [Role.Admin]: 0,
    [Role.Moderator]: 1,
    [Role.User]: 2,
    [Role.Default]: 3, 
  };
  return hierarchy[userRole] <= hierarchy[requiredRole];
}

export function hasPermissionAccess(
  userPermission: Permission,
  requiredPermission: Permission
): boolean {
  const priority = {
    [Permission.Admin]: 0,
    [Permission.Write]: 1,
    [Permission.Read]: 2,
  };
  return priority[userPermission] <= priority[requiredPermission];
}

const authMiddleware = {
  authenticateToken,
  requireRole,
  requirePermission,
  hasRoleAccess,
  hasPermissionAccess
};

export default authMiddleware;
