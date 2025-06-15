import { Router, Request, Response, NextFunction } from "express";
import { authenticateToken } from "@middlewares/auth.middleware";
import validationMiddleware from "@middlewares/validation.middleware";
import { CreateProjectDto, UpdateProjectDto } from "@validations/project.validation";
import { ProjectService } from "@services/project.service";

const router = Router();

// GET /projects?name=...
router.get("/", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await ProjectService.getProjects(req.query);
    return res.json(projects); // Added return
  } catch (error) {
    return next(error); // Added return
  }
});

// GET /projects/:id
router.get("/:id", authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await ProjectService.getProject(Number(req.params["id"]));
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.json(project);
  } catch (error) {
    return next(error); // Added return
  }
});

// POST /projects
router.post(
  "/",
  authenticateToken,
  validationMiddleware(CreateProjectDto),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await ProjectService.createProject(req.body);
      return res.status(201).json(project); // Added return
    } catch (error) {
      return next(error); // Added return
    }
  }
);

// PUT /projects/:id
router.put(
  "/:id",
  authenticateToken,
  validationMiddleware(UpdateProjectDto),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await ProjectService.updateProject(Number(req.params["id"]), req.body);
      return res.json(updated); // Added return
    } catch (error) {
      return next(error); // Added return
    }
  }
);

// DELETE /projects/:id
router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ProjectService.deleteProject(Number(req.params["id"]));
      return res.status(204).send(); // Added return
    } catch (error) {
      return next(error); // Added return
    }
  }
);

export default router;
