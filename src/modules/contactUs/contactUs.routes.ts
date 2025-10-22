import express from "express";

import { getContactUs, updateContactUs } from "./contactUs.controller";

const contactUsRoutes = express.Router();

contactUsRoutes.patch("/update-contact-us", updateContactUs);

contactUsRoutes.get("/get-contact-us", getContactUs);

export default contactUsRoutes;
