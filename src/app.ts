import express from "express";
import cors from "cors";
import customerRouter from "./modules/customer/customer.routes";

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

export default app;
