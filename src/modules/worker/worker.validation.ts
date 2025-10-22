import { z } from "zod";

// Step 1: Profile Information
export const workerProfileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2).optional(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  phone: z.string(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type WorkerProfileInput = z.infer<typeof workerProfileSchema>;
