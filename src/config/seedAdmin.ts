import bcrypt from "bcrypt";
import { ManagerModel } from "../modules/manager/manager.model";
import dotenv from "dotenv";

dotenv.config();

export const seedAdmin = async () => {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn("Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env file");
    return;
  }

  const existingManager = await ManagerModel.findOne({ email: ADMIN_EMAIL });
  if (existingManager) {
    console.log("Admin manager already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const adminManager = new ManagerModel({
    firstName: "Ahsan",
    lastName: "Mahfuz",
    address: "Dhaka",
    city: "Dhaka",
    state: "Bangladesh",
    phone: "0000000000",
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin",
    isBlocked: false,
    managerId: null,
    uploadPhoto: null,
  });

  await adminManager.save();
  console.log("Admin manager created successfully!");
};
