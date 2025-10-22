import { Request, Response, NextFunction } from 'express'
import { AboutUsModel } from './aboutUs.model'

export const updateAboutUs = async (
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

    const updatedAboutUs = await AboutUsModel.findOneAndUpdate(
      { createdBy: userId },
      { $set: { aboutUs: req.body.aboutUs } },
      { new: true, upsert: true }
    )

    res.status(200).json({
      message: 'About us updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const getAboutUs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId

    const aboutUsData = await AboutUsModel.findOne({ createdBy: userId })

    res.status(200).json({
      message: 'About us fetched successfully',
      aboutUs: aboutUsData?.aboutUs,
    })
  } catch (error) {
    next(error)
  }
}
