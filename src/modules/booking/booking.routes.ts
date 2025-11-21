import express from "express";
import {
  bookTimeSlot,
  getAllBookings,
  getBookingTrends,
  getCustomerBookings,
  getWorkerBookings,
  getWorkerMonthlyCalendar,
  getWorkerPopularity,
  handleStripeWebhook,
  initializePayment,
} from "./booking.controller";
import { authenticateCustomer } from "../../middlewares/customerMiddleware";
import { authenticateWorker } from "../../middlewares/workerMiddleware";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";
import bodyParser from "body-parser";

const bookingRouter = express.Router();
const payment = express.Router();

bookingRouter.post("/book-slot", authenticateCustomer, bookTimeSlot);
bookingRouter.post(
  "/initialize-payment",
  authenticateCustomer,
  initializePayment
);
bookingRouter.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);
// bookingRouter.post("/confirm-payment", authenticateCustomer, confirmPayment);

// payment.post(
//   "/webhook",
//   bodyParser.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

bookingRouter.get("/worker-book-slot", authenticateWorker, getWorkerBookings);
bookingRouter.get(
  "/customer-book-slot",
  authenticateCustomer,
  getCustomerBookings
);
bookingRouter.get(
  "/worker-monthly-calendar",
  authenticateWorker,
  getWorkerMonthlyCalendar
);
bookingRouter.get(
  "/popularity",
  authenticateAdminOrManager,
  getWorkerPopularity
);
bookingRouter.get(
  "/booking-trends",
  authenticateAdminOrManager,
  getBookingTrends
);
bookingRouter.get(
  "/get-all-bookings",
  authenticateAdminOrManager,
  getAllBookings
);

export default bookingRouter;
export { payment };
