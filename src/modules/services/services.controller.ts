import { Request, Response } from "express";
import {
  createServiceValidation,
  updateServiceValidation,
} from "./services.validation";
import { ServiceModel } from "./services.model";
import { paginate } from "../../helper/paginationHelper";

// --------------------
//  Create Service
// --------------------
export const createService = async (req: Request, res: Response) => {
  try {
    const validation = createServiceValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error.errors,
      });
      return;
    }

    const newService = await ServiceModel.create(validation.data);

    res.status(201).json({
      message: "Service created successfully",
      data: newService,
    });
  } catch (error: any) {
    console.error("Error creating service:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// --------------------
//  Update Service
// --------------------
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const validation = updateServiceValidation.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error.errors,
      });
      return;
    }

    const updatedService = await ServiceModel.findByIdAndUpdate(
      id,
      validation.data,
      { new: true }
    );

    if (!updatedService) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    res.status(200).json({
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error: any) {
    console.error("Error updating service:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// --------------------
//  Get All Service
// --------------------
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const sortField = String(req.query.sortField || "createdAt");
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const filter: Record<string, any> = {};
    if (req.query.serviceName) {
      filter.serviceName = { $regex: req.query.serviceName, $options: "i" };
    }

    const result = await paginate(ServiceModel, {
      page,
      limit,
      sort: { [sortField]: sortOrder },
      filter,
    });

    res.status(200).json({
      message: "Services retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// --------------------
//  Get One Service
// --------------------
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await ServiceModel.findById(id);

    if (!service) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    res.status(200).json({
      message: "Service retrieved successfully",
      data: service,
    });
  } catch (error: any) {
    console.error("Error fetching service:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// --------------------
//  Delete Service
// --------------------
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await ServiceModel.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    res.status(200).json({
      message: "Service deleted successfully",
      data: deleted,
    });
  } catch (error: any) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
