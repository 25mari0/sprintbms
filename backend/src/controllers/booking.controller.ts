import { Request, Response, NextFunction } from 'express';
import bookingService from '../services/booking.service';
import { JwtPayload } from '../types/authTypes';

const bookingController = {
  createBooking: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { customerId, licensePlate, pickupDate, services, workers } = req.body;

      const booking = await bookingService.createBooking(
        req.user!.business!.id, 
        customerId,
        licensePlate,
        new Date(pickupDate),
        services,
        workers,
      );

      res.status(201).json({
        status: 'success',
        data: booking,
        message: 'Booking created successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // gets full booking information by ID
  // the id is passed as a URL parameter when clicking on a booking from the presented list
  getBooking: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const businessId = req.user!.business!.id;

      const booking = await bookingService.getBookingById(id, businessId);

      res.json({ status: 'success', data: booking });
    } catch (error) {
      next(error);
    }
  },

  deleteBooking: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const businessId = req.user!.business!.id;

      await bookingService.deleteBooking(id, businessId);
      res.status(204).send();

    } catch (error) {
      const err = error as Error;
      err.message = `Error deleting booking: ${err.message}`;
      next(err);
    }
  },

  //update booking information (status, workers, charged_price, pickup_at)
  updateBooking: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const businessId = req.user!.business!.id;

      const booking = await bookingService.updateBooking(id, updateData, businessId);

      res.json({ status: 'success', data: booking });
    } catch (error) {
      next(error);
    }
  },

  getBookings: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Extract query parameters and convert types as needed
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        status: req.query.status as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        customerId: req.query.customerId as string,
        search: req.query.search as string,
        businessId: req.user!.business!.id
      };
  
      const bookings = await bookingService.getBookings(filters);
  
      res.json({ status: 'success', data: bookings });
    } catch (error) {
      next(error);
    }
  },

};

export default bookingController;
