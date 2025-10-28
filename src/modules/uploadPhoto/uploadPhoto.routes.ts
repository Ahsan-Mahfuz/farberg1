import express from "express";
import multer from "multer";
import {
  createUploadPhoto,
  getAllPhotos,
  getPhotoByTitle,
} from "./uploadPhoto.controller";
import { photoUpload } from "../../uploads/profilePhotoUpload";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";

const uploadPhotoRouter = express.Router();

uploadPhotoRouter.post(
  "/create-dynamic-photo",
  photoUpload.single("dynamicPhoto"),
  authenticateAdminOrManager,
  createUploadPhoto
);

uploadPhotoRouter.get(
  "/get-all-dynamic-photo",
  authenticateAdminOrManager,
  getAllPhotos
);

uploadPhotoRouter.get(
  "/get-one-dynamic-photo/:name",
  authenticateAdminOrManager,
  getPhotoByTitle
);

export default uploadPhotoRouter;
