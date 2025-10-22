import express from "express";
import {
  loginCustomer,
  updateProfile,
  getMyProfile,
  sendOtp,
  setNewPassword,
  createCustomer,
  setPassword,
  uploadProfilePicture,
} from "./customer.controller";
import { authenticateCustomer } from "../../middlewares/customerMiddleware";
import { customerPhotoUpload } from "../../uploads/customerPhotoUpload";

const customerRouter = express.Router();

customerRouter.post("/register", createCustomer);
customerRouter.patch("/set-password", setPassword);
customerRouter.patch(
  "/upload-picture",
  customerPhotoUpload.single("customerProfileImage"),
  uploadProfilePicture
);
customerRouter.post("/login", loginCustomer);
customerRouter.post("/forgot-password", sendOtp);
customerRouter.post("/set-new-password", setNewPassword);

customerRouter.get("/me", authenticateCustomer, getMyProfile);
customerRouter.patch("/update", authenticateCustomer, updateProfile);

export default customerRouter;
