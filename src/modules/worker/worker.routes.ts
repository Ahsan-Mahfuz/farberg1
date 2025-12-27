import express from "express";
import {
  getAllWorker,
  getOneWorker,
  registerWorker,
  toggleWorkerDelete,
  updateWorker,
} from "./worker.controller";
import { authenticateAdmin } from "../../middlewares/adminMiddleware";
import { photoUpload } from "../../uploads/profilePhotoUpload";
import { authenticateCustomer } from "../../middlewares/customerMiddleware";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";

const workerRouter = express.Router();

workerRouter.post(
  "/register",
  authenticateAdminOrManager,
  photoUpload.single("workerProfileImage"),
  registerWorker
);
workerRouter.patch(
  "/update-worker/:id",
  authenticateAdminOrManager,
  photoUpload.single("workerProfileImage"),
  updateWorker
);
workerRouter.get("/get-one-worker/:id", getOneWorker);
workerRouter.get("/get-all-worker", getAllWorker);
workerRouter.delete(
  "/delete-worker/:id",
  authenticateAdminOrManager,
  toggleWorkerDelete
);

export default workerRouter;
