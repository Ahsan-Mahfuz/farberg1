import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
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
        ? `/picture/workers/${req.file.filename}`
        : undefined,
    };

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
