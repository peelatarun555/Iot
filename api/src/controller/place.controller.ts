import { Router, Request, Response, NextFunction } from "express";
import PlaceService from "@services/place.service";
import { CreatePlaceDto, UpdatePlaceDto } from "@validations/place.validation";
import validationMiddleware from "@middlewares/validation.middleware";
import { authenticateToken } from "@middlewares/auth.middleware";

const router = Router();

// GET /places?name=...&parentName=...
router.get("/",  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const places = await PlaceService.getPlaces(req.query);
    res.json(places);
  } catch (error) {
    next(error);
  }
});

// POST /places
router.post(
  "/",
  authenticateToken,
  validationMiddleware(CreatePlaceDto),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const place = await PlaceService.createPlace(req.body);
      res.status(201).json(place);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /places/:id
router.put(
  "/:id",
  validationMiddleware(UpdatePlaceDto),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Fix: Use bracket notation to access params.id
      const updated = await PlaceService.updatePlace(
        Number(req.params['id']),  // Changed from req.params.id
        req.body
      );
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /places/:id
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PlaceService.deletePlace(Number(req.params['id']));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
