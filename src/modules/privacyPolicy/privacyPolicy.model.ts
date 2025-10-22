import { Schema, Types, model } from 'mongoose'

interface IPrivacyPolicy {
  privacyPolicy?: string | null
  createdBy: Types.ObjectId
}

const privacyPolicySchema = new Schema<IPrivacyPolicy>(
  {
    privacyPolicy: {
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

export const PrivacyPolicyModel = model<IPrivacyPolicy>('PrivacyPolicy', privacyPolicySchema)
