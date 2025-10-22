import { Request, Response, NextFunction } from 'express'
import { TermsAndConditionsModel } from './termsAndConditions.model'

export const updatedTermsAndConditions = async (
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

    const updatedTermsAndConditions =
      await TermsAndConditionsModel.findOneAndUpdate(
        { createdBy: userId },
        { $set: { termsAndConditions: req.body.termsAndConditions } },
        { new: true, upsert: true }
      )

    res.status(200).json({
      message: 'Terms and conditions updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const getTermsAndConditions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId

    const termsAndConditions = await TermsAndConditionsModel.findOne({
      createdBy: userId,
    })
    res.status(200).json({
      message: 'Terms and conditions fetched successfully',
      termsAndConditions: termsAndConditions?.termsAndConditions,
    })
  } catch (error) {
    next(error)
  }
}
