import express from "express";

import {
  getPrivacyPolicy,
  updatedPrivacyPolicy,
} from "./privacyPolicy.controller";

const privacyPolicyRoutes = express.Router();

privacyPolicyRoutes.patch("/update-privacy-policy", updatedPrivacyPolicy);

privacyPolicyRoutes.get("/get-privacy-policy", getPrivacyPolicy);

export default privacyPolicyRoutes;
