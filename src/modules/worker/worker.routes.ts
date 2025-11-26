import express from "express";
import {
  getAllWorker,
  getOneWorker,
  registerWorker,
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
workerRouter.get("/get-one-worker/:id", getOneWorker);
workerRouter.get("/get-all-worker", getAllWorker);

export default workerRouter;
