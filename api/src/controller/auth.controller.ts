import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { env , isDevEnv } from "@utils/env";
import { User } from "@schemas/user.schema";

const router = Router();

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input (add express-validator if needed)
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 1. Find user by email (with explicit error handling)
    const user = await User.findOne({ 
      where: { email },
      select: ["id", "email", "password", "role"] // Explicitly select password
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Verify password (ensure comparePassword exists in User model)
    if (!user.comparePassword) {
      throw new Error("User model missing comparePassword method");
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate JWT with proper error handling
    if (!env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable not set");
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || "1h" } // Fallback expiration
    );

    return res.json({ token });

  } catch (error) {
    console.error("Login error:", error); // Add logging
    return res.status(500).json({ 
      message: "Internal server error",
      ...(isDevEnv() && error instanceof Error && { error: error.message }) // Show error details in development
    });
  }
});

export default router;
