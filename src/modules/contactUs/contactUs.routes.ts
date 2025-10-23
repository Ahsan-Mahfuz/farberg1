import express from "express";

import {
  createContactUs,
  getContactUs,
  getContactUsById,
  updateStatusContactUsById,
} from "./contactUs.controller";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";

const contactUsRouter = express.Router();

contactUsRouter.post("/create-contact-us", createContactUs);

contactUsRouter.get(
  "/get-contact-us",
  authenticateAdminOrManager,
  getContactUs
);

contactUsRouter.get(
  "/get-one-contact-us/:id",
  authenticateAdminOrManager,
  getContactUsById
);

contactUsRouter.get(
  "/update-status-contact-us/:id",
  authenticateAdminOrManager,
  updateStatusContactUsById
);

export default contactUsRouter;
