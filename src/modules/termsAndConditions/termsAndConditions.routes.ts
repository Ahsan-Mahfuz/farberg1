import express from "express";

import {
  getTermsAndConditions,
  updatedTermsAndConditions,
} from "./termsAndConditions.controller";

const termsAndConditionsRoutes = express.Router();

termsAndConditionsRoutes.patch(
  "/update-terms-and-conditions",
  updatedTermsAndConditions
);

termsAndConditionsRoutes.get(
  "/get-terms-and-conditions",
  getTermsAndConditions
);

export default termsAndConditionsRoutes;
