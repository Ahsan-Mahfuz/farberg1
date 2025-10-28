import { Schema, model, Document } from "mongoose";

export interface IAccessibility extends Document {
  isDashboardShow: boolean;
  isAnalyticsShow: boolean;
  isUsersShow: boolean;
  isServicesShow: boolean;
  isTransactionsShow: boolean;
}

const accessibilitySchema = new Schema<IAccessibility>(
  {
    isDashboardShow: { type: Boolean, default: false },
    isAnalyticsShow: { type: Boolean, default: false },
    isUsersShow: { type: Boolean, default: false },
    isServicesShow: { type: Boolean, default: false },
    isTransactionsShow: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AccessibilityModel = model<IAccessibility>(
  "Accessibility",
  accessibilitySchema
);
