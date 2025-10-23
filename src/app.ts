import express from "express";
import cors from "cors";
import {
  customerOrWorkerRouter,
  customerRouter,
} from "./modules/customer/customer.routes";
import workerRouter from "./modules/worker/worker.routes";
import managerRouter from "./modules/manager/manager.routes";
import privacyPolicyRouter from "./modules/privacyPolicy/privacyPolicy.routes";
import termsAndConditionsRouter from "./modules/termsAndConditions/termsAndConditions.routes";
import aboutUsRouter from "./modules/aboutUs/aboutUs.routes";
import contactUsRouter from "./modules/contactUs/contactUs.routes";

const app = express();

app.use(
  cors({
    // origin: [
    //   'http://localhost:5173',
    //   'http://localhost:5174',
    //   'http://10.0.60.27:5173',

    // ],
    // credentials: true,
    origin: (origin, callback) => {
      callback(null, origin);
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/picture", express.static("picture"));

app.use("/customer", customerRouter);
app.use("/customer-or-worker", customerOrWorkerRouter);
app.use("/worker", workerRouter);
app.use("/manager", managerRouter);

// common api
app.use(
  "/public",
  privacyPolicyRouter,
  termsAndConditionsRouter,
  aboutUsRouter,
  contactUsRouter
);

export default app;
