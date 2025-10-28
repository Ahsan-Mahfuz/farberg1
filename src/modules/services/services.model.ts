import { Schema, model, Document } from "mongoose";

export interface ISubcategory {
  _id: string;
  subcategoryName: string;
  subcategoryPrice: number;
}

export interface IService extends Document {
  serviceName: string;
  price: string;
  subcategory?: ISubcategory[];
}

const subcategorySchema = new Schema<ISubcategory>({
  subcategoryName: { type: String, required: true },
  subcategoryPrice: { type: Number, required: true },
});

const serviceSchema = new Schema<IService>(
  {
    serviceName: { type: String, required: true },
    price: { type: String, required: true },
    subcategory: { type: [subcategorySchema], required: false },
  },
  { timestamps: true }
);

export const ServiceModel = model<IService>("Service", serviceSchema);
