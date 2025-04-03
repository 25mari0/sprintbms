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
      const { customerId, licensePlate, pickupDate, services } = req.body;

      const booking = await bookingService.createBooking(
        req.user!.business!.id, // assuming business ID is available in req.user due to route middleware
        customerId,
        licensePlate,
        new Date(pickupDate),
        services,
      );

      res.status(201).json({
        status: 'success',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  },

  // gets full booking information by ID
  // the id is passed as a URL parameter when clicking on a booking from the presented list
  getBooking: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id);

      res.json({ status: 'success', data: booking });
    } catch (error) {
      next(error);
    }
  },

  deleteBooking: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await bookingService.deleteBooking(id);
      res.status(204).send();

    } catch (error) {
      const err = error as Error;
      err.message = `Error deleting booking: ${err.message}`;
      next(err);
    }
  },

  //update booking information (status, workers, charged_price, pickup_at)
  updateBooking: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const booking = await bookingService.updateBooking(id, updateData);

      res.json({ status: 'success', data: booking });
    } catch (error) {
      next(error);
    }
  },

  getBookings: async (
    req: Request,
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
      };
  
      // Call the service with filters
      const response = await bookingService.getBookings(filters);
  
      // Return the response
      res.json({ status: 'success', ...response });
    } catch (error) {
      const err = error as Error;
      err.message = `Error getting bookings: ${err.message}`;
      next(err);
    }
  },

};

export default bookingController;
