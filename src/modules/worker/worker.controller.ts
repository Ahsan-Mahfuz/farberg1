import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { WorkerModel } from "./worker.model";
import { workerProfileSchema } from "./worker.validation";
import { paginate } from "../../helper/paginationHelper";
import { title } from "process";

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
// Update Worker
// --------------------
export const updateWorker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const worker = await WorkerModel.findById(id);
    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }

    const data = {
      ...req.body,
      uploadPhoto: req.file
        ? `/picture/profile_image/${req.file.filename}`
        : worker.uploadPhoto,
    };

    if (typeof data.services === "string") {
      try {
        data.services = JSON.parse(data.services);
      } catch {
        res.status(400).json({ message: "Invalid JSON in services field" });
        return;
      }
    }

    const parsed = workerProfileSchema.safeParse(data);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.errors });
      return;
    }

    const updatedWorker = await WorkerModel.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true }
    ).select(
      "-password -resetOtp -otpExpires -__v -otpVerified -createdAt -updatedAt"
    );

    res.status(200).json({
      message: "Worker updated successfully",
      data: updatedWorker,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating worker", error: err });
  }
};

// --------------------
// Get One Worker
// --------------------

export const getOneWorker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const worker = await WorkerModel.findById(id)
      .select(
        "-password -resetOtp -otpExpires -__v -otpVerified -createdAt -updatedAt"
      )
      .populate({
        path: "services",
        populate: {
          path: "service",
          model: "Service",
        },
      });
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
    const { page, limit, search, isBlocked, sortBy, order } = req.query;

    const filter: any = {};

    if (isBlocked !== undefined) {
      filter.isBlocked = isBlocked === "true";
    }

    if (search) {
      const regex = new RegExp(search as string, "i");

      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
        { title: regex },
      ];
    }
    const sort: any = {};
    if (sortBy) {
      sort[String(sortBy)] = order === "asc" ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const result = await paginate(WorkerModel, {
      page: Number(page),
      limit: Number(limit),
      sort,
      filter,
    });

    const populatedData = await Promise.all(
      result.data.map(async (worker: any) => {
        const obj = worker.toObject ? worker.toObject() : worker;

        obj.services = await Promise.all(
          obj.services.map(async (s: any) => {
            const serviceDoc = await WorkerModel.db
              .collection("services")
              .findOne({ _id: s.service });

            const subcategories = s.subcategories
              ? await Promise.all(
                  s.subcategories.map(async (subId: any) => {
                    return await WorkerModel.db
                      .collection("subcategories")
                      .findOne({ _id: subId });
                  })
                )
              : [];

            return {
              service: serviceDoc,
              subcategories,
            };
          })
        );

        delete obj.password;
        delete obj.resetOtp;
        delete obj.otpExpires;
        delete obj.__v;
        delete obj.otpVerified;
        delete obj.createdAt;
        delete obj.updatedAt;

        return obj;
      })
    );

    res.status(200).json({
      message: "Workers fetched successfully",
      data: populatedData,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting workers", error: err });
  }
};
