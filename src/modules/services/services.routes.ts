import express from "express";
import {
  createService,
  updateService,
  deleteService,
  getAllServices,
  getServiceById,
} from "./services.controller";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";

const serviceRouter = express.Router();

serviceRouter.post(
  "/create-service",
  authenticateAdminOrManager,
  createService
);
serviceRouter.get("/get-all-services", getAllServices);
serviceRouter.get("/get-one-service/:id", getServiceById);
serviceRouter.patch(
  "/update-service/:id",
  authenticateAdminOrManager,
  updateService
);
serviceRouter.delete(
  "/delete-service/:id",
  authenticateAdminOrManager,
  deleteService
);

export default serviceRouter;
