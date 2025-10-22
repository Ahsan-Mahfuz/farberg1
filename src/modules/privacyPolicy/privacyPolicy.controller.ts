import { Request, Response, NextFunction } from 'express'
import { PrivacyPolicyModel } from './privacyPolicy.model'

export const updatedPrivacyPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized Access' })
      return
    }

    const updatedPrivacyPolicy = await PrivacyPolicyModel.findOneAndUpdate(
      { createdBy: userId },
      { $set: { privacyPolicy: req.body.privacyPolicy } },
      { new: true, upsert: true }
    )

    res.status(200).json({
      message: 'Privacy policy updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const getPrivacyPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId

    const privacyPolicy = await PrivacyPolicyModel.findOne({
      createdBy: userId,
    })
    res.status(200).json({
      message: 'Privacy policy fetched successfully',
      privacyPolicy: privacyPolicy?.privacyPolicy,
    })
  } catch (error) {
    next(error)
  }
}
