import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { WorkerModel } from "./worker.model";
import { workerProfileSchema } from "./worker.validation";

// --------------------
// Register Worker
// --------------------
export const registerWorker = async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      uploadPhoto: req.file
        ? `/picture/profile_image/${req.file.filename}`
        : undefined,
    };

    if (typeof data.services === "string") {
      try {
        data.services = JSON.parse(data.services);
      } catch {
        res.status(400).json({ message: "Invalid JSON in services field" });
        return;
      }
    }

    console.log(data);

    const parsed = workerProfileSchema.safeParse(data);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.errors });
      return;
    }

    const { email, password } = parsed.data;

    const existing = await WorkerModel.findOne({ email });
    if (existing) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const worker = new WorkerModel({
      ...parsed.data,
      uploadPhoto: `http://${process?.env?.HOST}:${process?.env?.PORT}${data.uploadPhoto}`,
      password: hashedPassword,
    });

    await worker.save();

    res
      .status(201)
      .json({ message: "Worker created successfully", data: worker });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering worker", error: err });
  }
};

// --------------------
// Get One Worker
// --------------------

export const getOneWorker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const worker = await WorkerModel.findById(id).select(
      "-password -resetOtp -otpExpires -__v -otpVerified -createdAt -updatedAt"
    );
    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }
    res.status(200).json({ message: "Worker found", data: worker });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting worker", error: err });
  }
};

// --------------------
// Get All Worker
// --------------------
export const getAllWorker = async (req: Request, res: Response) => {
  try {
    const { isBlocked } = req.query;

    const filter: any = {};
    if (isBlocked !== undefined) {
      filter.isBlocked = isBlocked === "true";
    }

    const workers = await WorkerModel.find(filter).select(
      "-password -resetOtp -otpExpires -__v -otpVerified -createdAt -updatedAt"
    );

    res.status(200).json({ message: "Workers found", data: workers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting workers", error: err });
  }
};
