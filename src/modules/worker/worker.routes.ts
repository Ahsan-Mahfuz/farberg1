import express from "express";
import { registerWorker } from "./worker.controller";
import { authenticateAdmin } from "../../middlewares/adminMiddleware";

const workerRouter = express.Router();

workerRouter.post("/register", registerWorker);
// workerRouter.post("/register", authenticateAdmin, registerWorker);

export default workerRouter;
