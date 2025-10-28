import express from "express";
import {
  bookTimeSlot,
  getCustomerBookings,
  getWorkerBookings,
} from "./booking.controller";
import { authenticateCustomer } from "../../middlewares/customerMiddleware";
import { authenticateWorker } from "../../middlewares/workerMiddleware";

const bookingRouter = express.Router();

bookingRouter.post("/book-slot", authenticateCustomer, bookTimeSlot);
bookingRouter.get("/worker-book-slot", authenticateWorker, getWorkerBookings);
bookingRouter.get(
  "/customer-book-slot",
  authenticateCustomer,
  getCustomerBookings
);

export default bookingRouter;
