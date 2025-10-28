import { Request, Response } from "express";
import { BookingModel } from "./booking.model";
import { TimeSlotModel } from "../timeSlot/timeSlot.model";
import { CustomerModel } from "../customer/customer.model";
import { WorkerModel } from "../worker/worker.model";
import { ServiceModel } from "../services/services.model";
import generateDefaultSlots from "../timeSlot/timeSlot.controller";

// --------------------
// Booking Slot By Customer
// --------------------
export const bookTimeSlot = async (req: any, res: Response) => {
  try {
    const { userId: customerId } = req.user;
    const { workerId, services, date, startTime } = req.body;

    if (
      !workerId ||
      !services ||
      !Array.isArray(services) ||
      services.length === 0 ||
      !date ||
      !startTime
    ) {
      res.status(400).json({ message: "Missing or invalid required fields" });
      return;
    }

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    const worker = await WorkerModel.findById(workerId).populate("services");
    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }

    const workerServiceIds = worker.services.map((s: any) =>
      s.service.toString()
    );

    for (const srv of services) {
      if (!workerServiceIds.includes(srv.serviceId)) {
        res.status(400).json({
          message: `Worker does not provide service ${srv.serviceId}`,
        });
        return;
      }

      // if (srv.serviceCategories && srv.serviceCategories.length > 0) {
      //   const serviceDoc = await ServiceModel.findById(srv.serviceId);
      //   const allowedCategories =
      //     serviceDoc?.subcategory?.map((sub: any) => sub.toString()) || [];

      //   const invalidCategories = srv.serviceCategories.filter(
      //     (sub: any) => !allowedCategories.includes(sub)
      //   );

      //   // if (invalidCategories.length > 0) {
      //   //   return res.status(400).json({
      //   //     message: `Invalid subcategories for service ${srv.serviceId}`,
      //   //     invalidCategories,
      //   //   });
      //   // }
      // }
    }

    let timeSlotDoc = await TimeSlotModel.findOne({ worker: workerId, date });
    if (!timeSlotDoc) {
      timeSlotDoc = new TimeSlotModel({
        worker: workerId,
        date,
        slots: generateDefaultSlots(),
      });

      await timeSlotDoc.save();
    }

    if (timeSlotDoc.isOffDay) {
      res.status(400).json({ message: "Worker is off on this day" });
      return;
    }

    const slotIndex = timeSlotDoc.slots.findIndex(
      (s) => s.startTime === startTime
    );
    if (slotIndex === -1) {
      res.status(404).json({ message: "Slot not found" });
      return;
    }

    const slot = timeSlotDoc.slots[slotIndex];

    if (slot.isBlocked) {
      res.status(400).json({ message: "Slot is blocked" });
      return;
    }

    if (!slot.isAvailable || slot.isBooked) {
      res.status(400).json({ message: "Slot is not available" });
      return;
    }

    slot.isBooked = true;
    slot.isAvailable = false;
    slot.isBlocked = false;

    const prevSlot = timeSlotDoc.slots[slotIndex - 1];
    const nextSlot = timeSlotDoc.slots[slotIndex + 1];

    if (prevSlot) prevSlot.isBlocked = true;
    if (nextSlot) nextSlot.isBlocked = true;

    await timeSlotDoc.save();

    const formattedServices = services.map((srv: any) => ({
      service: srv.serviceId,
      subcategories: srv.serviceCategories || [],
    }));

    const booking = await BookingModel.create({
      customer: customerId,
      worker: workerId,
      services: formattedServices,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "booked",
    });

    res.status(201).json({
      message: "Slot booked successfully",
      data: booking,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      message: "Error booking slot",
      error: err.message,
    });
  }
};

// --------------------
// Get Worker Bookings
// --------------------
export const getWorkerBookings = async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;

    const worker = await WorkerModel.findById(workerId);
    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    const status = req.query.status; // optional: "booked" | "completed" | "cancelled"
    const filterType = req.query.filter; // optional: "upcoming" | "completed"

    // Query base
    const query: any = { worker: workerId };

    // Month + year filtering (1–30/31 days)
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59); // last day of month
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Filter by status (booked, completed, cancelled)
    if (status) {
      query.status = status;
    }

    // Date-based filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (filterType === "upcoming") {
      query.date = { ...query.date, $gte: today };
    } else if (filterType === "completed") {
      query.date = { ...query.date, $lt: today };
    }

    // Count + Data
    const total = await BookingModel.countDocuments(query);
    const bookings = await BookingModel.find(query)
      .populate({
        path: "customer",
        select: "firstName lastName email phone",
      })
      .populate({
        path: "services.service",
        select: "name price",
      })
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(limit);

    // Group bookings by date (optional)
    const groupedByDate = bookings.reduce((acc: any, booking: any) => {
      const day = booking.date.toISOString().split("T")[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(booking);
      return acc;
    }, {});

    res.status(200).json({
      message: "Worker bookings fetched successfully",
      month,
      year,
      data: groupedByDate, // or use bookings if you don't want grouping
      pagination: {
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Error fetching worker bookings:", err);
    res.status(500).json({
      message: "Error fetching worker bookings",
      error: err.message,
    });
  }
};

// --------------------
// Get Customer Bookings
// --------------------
export const getCustomerBookings = async (req: any, res: Response) => {
  try {
    const customerId = req.user.userId;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    const status = req.query.status; // optional: "booked" | "completed" | "cancelled"
    const filterType = req.query.filter; // optional: "upcoming" | "completed"

    // Base query
    const query: any = { customer: customerId };

    // Month + year filtering
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Date-based filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (filterType === "upcoming") {
      query.date = { ...query.date, $gte: today };
    } else if (filterType === "completed") {
      query.date = { ...query.date, $lt: today };
    }

    // Count + Data
    const total = await BookingModel.countDocuments(query);
    const bookings = await BookingModel.find(query)
      .populate({
        path: "worker",
        select: "firstName lastName email phone",
      })
      .populate({
        path: "services.service",
        select: "name price",
      })
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(limit);

    // Group bookings by date
    const groupedByDate = bookings.reduce((acc: any, booking: any) => {
      const day = booking.date.toISOString().split("T")[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(booking);
      return acc;
    }, {});

    res.status(200).json({
      message: "Customer bookings fetched successfully",
      month,
      year,
      data: groupedByDate,
      pagination: {
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Error fetching customer bookings:", err);
    res.status(500).json({
      message: "Error fetching customer bookings",
      error: err.message,
    });
  }
};
