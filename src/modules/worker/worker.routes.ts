import express from "express";
import { getAllWorker, getOneWorker, registerWorker } from "./worker.controller";
import { authenticateAdmin } from "../../middlewares/adminMiddleware";
import { photoUpload } from "../../uploads/profilePhotoUpload";
import { authenticateCustomer } from "../../middlewares/customerMiddleware";

const workerRouter = express.Router();

workerRouter.post(
  "/register",
  authenticateAdmin,
  photoUpload.single("workerProfileImage"),
  registerWorker
);
workerRouter.get("/get-one-worker/:id", authenticateCustomer, getOneWorker);
workerRouter.get("/get-all-worker", authenticateCustomer, getAllWorker);

export default workerRouter;
