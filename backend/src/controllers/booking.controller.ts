// backend/src/controllers/booking.controller.ts
import { Request, Response, NextFunction } from 'express';
import bookingService from '../services/booking.service';
import { BookingFilter } from '../types/bookingTypes';
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

      if (!booking) throw new Error('Booking not found');

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

  getBookingsWithFilter: async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const filters: BookingFilter = {
        status: req.query.status as string | undefined,
        vehicle_license_plate: req.query.vehicle_license_plate as
          | string
          | undefined,
        pickup_at: req.query.pickup_at
          ? new Date(req.query.pickup_at as string)
          : undefined,
        created_at: req.query.created_at
          ? new Date(req.query.created_at as string)
          : undefined,
      };

      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10; // default to 10 if not provided

      const { bookings, total } = await bookingService.getBookingsWithFilter(
        req.user!.business!.id,
        filters,
        { page, pageSize }, // backend will apply maxPageSize internally
      );

      res.json({
        status: 'success',
        data: {
          bookings,
          meta: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
          },
        },
      });
    } catch (error) {
      const err = error as Error;
      err.message = `Error getting bookings: ${err.message}`;
      next(err);
    }
  },
};

export default bookingController;
