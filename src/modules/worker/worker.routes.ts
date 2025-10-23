import express from "express";
import { registerWorker } from "./worker.controller";
import { authenticateAdmin } from "../../middlewares/adminMiddleware";
import { photoUpload } from "../../uploads/profilePhotoUpload";

const workerRouter = express.Router();

workerRouter.post(
  "/register",
  authenticateAdmin,
  photoUpload.single("workerProfileImage"),
  registerWorker
);

export default workerRouter;
