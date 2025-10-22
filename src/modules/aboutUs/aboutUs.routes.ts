import express from "express";

import { getAboutUs, updateAboutUs } from "./aboutUs.controller";

const aboutUsRoutes = express.Router();

aboutUsRoutes.patch("/update-about-us", updateAboutUs);

aboutUsRoutes.get("/get-about-us", getAboutUs);

export default aboutUsRoutes;
