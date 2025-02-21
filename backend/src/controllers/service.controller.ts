import { Request, Response, NextFunction } from 'express';
import serviceService from '../services/service.service';
import { JwtPayload } from '../types/authTypes';
 

const serviceController = {
  createService: async (
    req: Request  & { user?: JwtPayload },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, price, estimated_time_minutes } = req.body;
      const service = await serviceService.createService(
        req.user?.business?.id || '',
        name,
        price,
        estimated_time_minutes
      );
      res.status(201).json({ status: 'success', data: service });
    } catch (error) {
      next(error);
    }
  },

  getAllServices: async (
    req: Request  & { user?: JwtPayload },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const services = await serviceService.getAllServicesForBusiness(req.user!.business!.id);
      res.json({ status: 'success', data: services });
    } catch (error) {
      next(error);
    }
  },

  getServiceById: async (
    req: Request  & { user?: JwtPayload },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const service = await serviceService.getServiceById(req.params.id, req.user!.business!.id);
      if (!service) {
        throw new Error ('Service not found');
      }
      res.json({ status: 'success', data: service });
    } catch (error) {
      next(error);
    }
  },

  updateService: async (
    req: Request  & { user?: JwtPayload },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, price, estimated_time_minutes } = req.body;
      const updatedService = await serviceService.updateService(
        req.params.id,
        req.user!.business!.id,
        { name, price, estimated_time_minutes }
      );

      res.json({ status: 'success', data: updatedService });
    } catch (error) {
      next(error);
    }
  },

  deleteService: async (
    req: Request  & { user?: JwtPayload },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await serviceService.deleteService(req.params.id, req.user!.business!.id);

      res.status(204).send(); // No content - successful delete
    } catch (error) {
        next(error);
    }
  },
};

export default serviceController;