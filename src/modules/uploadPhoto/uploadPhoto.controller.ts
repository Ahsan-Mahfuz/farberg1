import { Request, Response } from "express";
import { UploadPhotoInput, uploadPhotoSchema } from "./uploadPhoto.validation";
import { UploadPhotoModel } from "./uploadPhoto.model";

export const createUploadPhoto = async (req: Request, res: Response) => {
  try {
    const validatedData: UploadPhotoInput = uploadPhotoSchema.parse({
      title: req.body.title,
    });

    const image = req.file
      ? `/picture/profile_image/${req.file.filename}`
      : undefined;

    const fullImageUrl = image
      ? `http://${process?.env?.HOST}:${process?.env?.PORT}${image}`
      : undefined;

    const existingPhoto = await UploadPhotoModel.findOne({
      title: validatedData.title,
    });

    if (existingPhoto) {
      if (fullImageUrl) {
        existingPhoto.image = fullImageUrl;
      }
      await existingPhoto.save();

      res.status(200).json({
        message: "Photo updated successfully",
        data: existingPhoto,
      });
      return;
    }

    const newPhoto = new UploadPhotoModel({
      title: validatedData.title,
      image: fullImageUrl,
    });

    await newPhoto.save();

    res.status(201).json({
      message: "Photo uploaded successfully",
      data: newPhoto,
    });
  } catch (err: any) {
    if (err?.issues) {
      res.status(400).json({ errors: err.issues });
      return;
    }
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllPhotos = async (req: Request, res: Response) => {
  try {
    const photos = await UploadPhotoModel.find();
    res.status(200).json({ data: photos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPhotoByTitle = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const photo = await UploadPhotoModel.findOne({ title: name });
    if (!photo) {
      res.status(404).json({ message: "Photo not found" });
      return;
    }
    res.status(200).json({ data: photo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
