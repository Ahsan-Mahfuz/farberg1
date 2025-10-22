import { Request, Response, NextFunction } from 'express'
import { ContactUsModel } from './contactUs.model'

export const updateContactUs = async (
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

    const updatedContactUs = await ContactUsModel.findOneAndUpdate(
      { createdBy: userId },
      { $set: { contactUs: req.body.contactUs } },
      { new: true, upsert: true }
    )

    res.status(200).json({
      message: 'Contact us updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const getContactUs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId

    const contactUsData = await ContactUsModel.findOne({ createdBy: userId })
    res.status(200).json({
      message: 'Contact us fetched successfully',
      contactUs: contactUsData?.contactUs,
    })
  } catch (error) {
    next(error)
  }
}
