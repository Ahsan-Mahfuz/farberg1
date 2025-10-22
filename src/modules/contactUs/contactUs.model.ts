import { Schema, Types, model } from 'mongoose'

interface IContactUs {
  contactUs?: string | null
  createdBy: Types.ObjectId
}

const contactUsSchema = new Schema<IContactUs>(
  {
    contactUs: {
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

export const ContactUsModel = model<IContactUs>('ContactUs', contactUsSchema)
