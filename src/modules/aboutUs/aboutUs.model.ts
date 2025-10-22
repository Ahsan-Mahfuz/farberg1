import { Schema, Types, model } from 'mongoose'

interface IAboutUs {
  aboutUs?: string | null
  createdBy: Types.ObjectId
}

const aboutUsSchema = new Schema<IAboutUs>(
  {
    aboutUs: {
      type: String,
      required: false,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

export const AboutUsModel = model<IAboutUs>('AboutUs', aboutUsSchema)
