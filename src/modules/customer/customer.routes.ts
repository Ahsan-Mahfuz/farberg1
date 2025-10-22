import express from "express";
import {
  loginCustomerOrWorker,
  updateProfile,
  getMyProfile,
  sendOtp,
  setNewPassword,
  createCustomer,
  setPassword,
  uploadProfilePicture,
  verifyOtp,
} from "./customer.controller";
import { customerOrWorkerMiddleware } from "../../middlewares/customerOrWorkerMiddleware";
import { customerPhotoUpload } from "../../uploads/customerPhotoUpload";

const customerRouter = express.Router();
const customerOrWorkerRouter = express.Router();

customerRouter.post("/register", createCustomer);
customerRouter.patch("/set-password", setPassword);
customerRouter.patch(
  "/upload-picture",
  customerPhotoUpload.single("customerProfileImage"),
  uploadProfilePicture
);

// common api for customer and worker
customerOrWorkerRouter.post("/login", loginCustomerOrWorker);
customerOrWorkerRouter.post("/forgot-password", sendOtp);
customerOrWorkerRouter.post("/verify-otp", verifyOtp);
customerOrWorkerRouter.post("/set-new-password", setNewPassword);
customerOrWorkerRouter.get("/me", customerOrWorkerMiddleware, getMyProfile);
customerOrWorkerRouter.patch(
  "/update",
  customerOrWorkerMiddleware,
  updateProfile
);

export { customerOrWorkerRouter, customerRouter };
