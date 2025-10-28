import { Request, Response } from "express";
import { TimeSlotModel } from "./timeSlot.model";

function generateDefaultSlots() {
  const slots = [];
  let hour = 9;
  let minute = 0;

  while (hour < 19 || (hour === 19 && minute === 0)) {
    const start = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    let nextHour = hour;
    let nextMinute = minute + 30;
    if (nextMinute >= 60) {
      nextHour += 1;
      nextMinute -= 60;
    }

    const end = `${nextHour.toString().padStart(2, "0")}:${nextMinute
      .toString()
      .padStart(2, "0")}`;

    slots.push({
      startTime: start,
      endTime: end,
      isAvailable: true,
      isBooked: false,
    });

    hour = nextHour;
    minute = nextMinute;
  }

  return slots;
}

export default generateDefaultSlots;

// ---------------------------------------
// Set Worker Unavailability
// ---------------------------------------
export const setWorkerUnAvailability = async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;
    const { date, unavailableSlots } = req.body;

    if (!date || !Array.isArray(unavailableSlots)) {
      res
        .status(400)
        .json({ message: "Date and unavailableSlots are required" });
      return;
    }

    let timeSlot = await TimeSlotModel.findOne({ worker: workerId, date });

    if (!timeSlot) {
      timeSlot = new TimeSlotModel({
        worker: workerId,
        date,
        slots: generateDefaultSlots(),
      });
    }

    timeSlot.slots.forEach((slot) => {
      if (unavailableSlots.includes(slot.startTime)) {
        slot.isAvailable = false;
      }
    });

    await timeSlot.save();

    res.status(200).json({
      message: "Unavailability updated successfully",
      data: timeSlot,
    });
  } catch (err: any) {
    console.error("Error setting unavailability:", err);
    res.status(500).json({
      message: "Error setting unavailability",
      error: err.message,
    });
  }
};

// -------------------------
// Set OffDay
// -------------------------
export const setOffDay = async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;
    const { date } = req.body;

    if (!date) {
      res.status(400).json({ message: "Date is required" });
      return;
    }

    const timeSlot = await TimeSlotModel.findOneAndUpdate(
      { worker: workerId, date },
      { worker: workerId, date, isOffDay: true, slots: [] },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Off day set successfully",
      data: timeSlot,
    });
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error setting off day", error: err.message });
  }
};

// -------------------------
// Get All Workers Availability (Paginated)
// -------------------------
export const getAllWorkerAvailability = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await TimeSlotModel.countDocuments();
    const timeSlots = await TimeSlotModel.find()
      .populate("worker", "firstName lastName workerId city state address")
      .skip(skip)
      .limit(limit)
      .sort({ date: 1 });

    res.status(200).json({
      message: "Workers availability fetched successfully",
      data: timeSlots,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching worker availability",
      error: err.message,
    });
  }
};

// -------------------------
// Get One Worker's Availability
// -------------------------
export const getWorkerAvailability = async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;
    const { date } = req.query;

    if (!date) {
      res.status(400).json({ message: "Date query parameter is required" });
      return;
    }

    let timeSlot = await TimeSlotModel.findOne({
      worker: workerId,
      date,
    });

    if (!timeSlot) {
      timeSlot = new TimeSlotModel({
        worker: workerId,
        date,
        slots: generateDefaultSlots(),
      });
    }

    await timeSlot.save();

    //     if (!timeSlot) {
    //       res.status(404).json({
    //         message: "No availability found for this worker on this date",
    //       });
    //       return;
    //     }

    res.status(200).json({
      message: "Worker availability fetched successfully",
      data: timeSlot,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching worker availability",
      error: err.message,
    });
  }
};
