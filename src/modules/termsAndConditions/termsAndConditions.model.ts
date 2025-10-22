import { Schema, Types, model } from 'mongoose'

interface ITermsAndConditions {
  termsAndConditions?: string | null
  createdBy: Types.ObjectId
}

const termsAndConditionsSchema = new Schema<ITermsAndConditions>(
  {
    termsAndConditions: {
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

export const TermsAndConditionsModel = model<ITermsAndConditions>(
  'TermsAndConditions',
  termsAndConditionsSchema
)
