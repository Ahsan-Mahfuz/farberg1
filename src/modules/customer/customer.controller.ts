import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { CustomerModel } from "./customer.model";
import {
  customerProfileSchema,
  customerLoginSchema,
  customerPasswordSchema,
} from "./customer.validation";
import findUserByEmail from "../../utils/checkCustomerOrWorker";
import { WorkerModel } from "../worker/worker.model";
import { workerProfileSchema } from "../worker/worker.validation";
import { paginate } from "../../helper/paginationHelper";

// --------------------
// Register Customer
// --------------------
export const createCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = customerProfileSchema.parse(req.body);

    const existing = await CustomerModel.findOne({ email: data.email });
    if (existing) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const newCustomer = await CustomerModel.create({
      ...data,
    });

    res
      .status(201)
      .json({ message: "Customer created successfully", data: newCustomer });
  } catch (error: any) {
    if (error instanceof z.ZodError)
      res.status(400).json({ message: error.errors.map((e) => e.message) });
    next(error);
  }
};

// -----------------------
// Set Password Customer
// -----------------------
export const setPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = customerPasswordSchema.parse(req.body);

    const user = await CustomerModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.password) {
      res.status(400).json({ message: "Password already set" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password set successfully" });
  } catch (err: any) {
    res
      .status(400)
      .json({ message: err.errors?.[0]?.message || "Error setting password" });
  }
};

// -------------------------------
// Upload Profile Picture Customer
// -------------------------------
export const uploadProfilePicture = async (req: any, res: Response) => {
  try {
    const { email } = req.body;
    const user = await CustomerModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const profileImagePath = `/picture/profile_image/${req.file.filename}`;
    user.uploadPhoto = `http://${process?.env?.HOST}:${process?.env?.PORT}${profileImagePath}`;
    await user.save();

    res.json({
      message: "Profile picture uploaded successfully",
      data: {
        customerProfileImage: `http://${process?.env?.HOST}:${process?.env?.PORT}${profileImagePath}`,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading profile picture" });
  }
};

// --------------------
//  Login
// --------------------
export const loginCustomerOrWorker = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = customerLoginSchema.parse(req.body);

    const found = await findUserByEmail(email);
    if (!found || !found.user.password) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const { user } = found;

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        city: user.city,
        state: user.state,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    next(error);
  }
};

// --------------------
// Get My Profile
// --------------------
export const getMyProfile = async (req: any, res: Response) => {
  try {
    const { userId, role } = req.user;

    if (role === "worker") {
      const user = await WorkerModel.findById(userId).select("-password");
      if (!user) {
        res.status(404).json({ message: "Worker not found" });
        return;
      }
      res.json({ data: user });
      return;
    }

    const user = await CustomerModel.findById(userId).select(
      "-password -__v -otpVerified -resetOtp -otpExpires"
    );
    if (!user) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// --------------------
//  Update Profile
// --------------------
export const updateProfile = async (req: any, res: Response) => {
  try {
    const { userId, role } = req.user;
    let data = req.body;

    if (data.services && typeof data.services === "string") {
      try {
        data.services = JSON.parse(data.services);
      } catch {
        res.status(400).json({ message: "Invalid JSON in services field" });
        return;
      }
    }

    const uploadedPhotoPath = req.file
      ? `/picture/profile_image/${req.file.filename}`
      : undefined;

    //  WORKER SECTION
    if (role === "worker") {
      const parsed = workerProfileSchema.partial().safeParse(data);
      if (!parsed.success) {
        res.status(400).json({ message: parsed.error.errors });
        return;
      }

      delete (parsed.data as any).email;
      delete (parsed.data as any).password;

      const updateData = {
        ...parsed.data,
        ...(uploadedPhotoPath ? { uploadPhoto: uploadedPhotoPath } : {}),
      };

      const updatedWorker = await WorkerModel.findByIdAndUpdate(
        userId,
        updateData,
        {
          new: true,
        }
      ).select("-password");

      if (!updatedWorker) {
        res.status(404).json({ message: "Worker not found" });
        return;
      }

      res.json({
        message: "Worker profile updated successfully",
        data: updatedWorker,
      });
      return;
    }

    // CUSTOMER SECTION
    const parsed = customerProfileSchema.partial().safeParse(data);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.errors });
      return;
    }

    const updateData = {
      ...parsed.data,
      ...(uploadedPhotoPath ? { uploadPhoto: uploadedPhotoPath } : {}),
    };

    const updatedCustomer = await CustomerModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedCustomer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    res.json({
      message: "Customer profile updated successfully",
      data: updatedCustomer,
    });
  } catch (err: any) {
    res.status(500).json({
      message: err.errors?.[0]?.message || "Error updating profile",
      error: err.message,
    });
    return;
  }
};

// --------------------
// Send OTP (Forgot Password)
// --------------------
export const sendOtp = async (req: any, res: Response) => {
  try {
    const { email } = req.body;

    const found = await findUserByEmail(email);
    if (!found) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { user } = found;

    const otp = Math.floor(100000 + Math.random() * 900000);
    (user as any).resetOtp = otp;
    (user as any).otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.json({ message: `OTP sent to ${email} email` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};
// --------------------
// Verify OTP
// --------------------
export const verifyOtp = async (req: any, res: Response) => {
  try {
    const { email, otp } = req.body;

    const found = await findUserByEmail(email);
    if (!found) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { user } = found;

    if (
      (user as any).resetOtp !== Number(otp) ||
      (user as any).otpExpires < Date.now()
    ) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    (user as any).otpVerified = true;
    await user.save();

    res.json({ message: `OTP verified successfully for ${email}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// --------------------
// Set New Password
// --------------------

export const setNewPassword = async (req: any, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    const found = await findUserByEmail(email);
    if (!found) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { user } = found;

    if ((user as any).otpVerified !== true) {
      res.status(400).json({ message: "First verify OTP" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    (user as any).resetOtp = undefined;
    (user as any).otpExpires = undefined;
    (user as any).otpVerified = false;

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        city: user.city,
        state: user.state,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({ message: "Password reset successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

// --------------------
// Get All Customers
// --------------------

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const sortField = String(req.query.sortField || "createdAt");
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const filter: Record<string, any> = { role: "customer" };

    if (req.query.search) {
      const search = String(req.query.search);
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const result = await paginate(CustomerModel, {
      page,
      limit,
      sort: { [sortField]: sortOrder },
      filter,
    });

    res.status(200).json({
      message: "Customers retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
