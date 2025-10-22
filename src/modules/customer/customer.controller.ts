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

    const profileImagePath = `/picture/customer_profile_image/${req.file.filename}`;
    user.uploadPhoto = profileImagePath;
    await user.save();

    res.json({
      message: "Profile picture uploaded successfully",
      data: { customerProfileImage: `http://${process?.env?.HOST}:${process?.env?.PORT}${profileImagePath}` },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading profile picture" });
  }
};

// --------------------
//  Login
// --------------------
export const loginCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = customerLoginSchema.parse(req.body);

    const user = await CustomerModel.findOne({ email });
    if (!user || !user.password) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      {
        customer: {
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          city: user.city,
          state: user.state,
          phone: user.phone,
          email: user.email,
          role: user.role,
        },
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
    const user = await CustomerModel.findById(req.user.userId).select(
      "-password"
    );
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// --------------------
//  Update Profile
// --------------------
export const updateProfile = async (req: any, res: Response) => {
  try {
    const data = customerProfileSchema.partial().parse(req.body);

    const uploadedPhotoPath = req.file
      ? `/picture/customers/${req.file.filename}`
      : undefined;

    const updateData = {
      ...data,
      ...(uploadedPhotoPath ? { uploadPhoto: uploadedPhotoPath } : {}),
    };

    const updatedCustomer = await CustomerModel.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedCustomer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    res.json({
      message: "Profile updated successfully",
      data: updatedCustomer,
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: err.errors?.[0]?.message || "Error updating profile",
    });
  }
};

// --------------------
// Send OTP (Forgot Password)
// --------------------
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await CustomerModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

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

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// --------------------
// Verify OTP
// --------------------
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await CustomerModel.findOne({ email });
    if (
      !user ||
      (user as any).resetOtp !== Number(otp) ||
      (user as any).otpExpires < Date.now()
    ) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// --------------------
// Set New Password
// --------------------
export const setNewPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await CustomerModel.findOne({ email });
    if (
      !user ||
      (user as any).resetOtp !== Number(otp) ||
      (user as any).otpExpires < Date.now()
    ) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    (user as any).resetOtp = undefined;
    (user as any).otpExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting password" });
  }
};
