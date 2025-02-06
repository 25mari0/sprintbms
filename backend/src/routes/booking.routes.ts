// backend/src/routes/booking.routes.ts
import { Router } from 'express';
import bookingController from '../controllers/booking.controller';
import authMiddleware from '../middlewares/token.middleware';
import businessMiddleware from '../middlewares/business.middleware';

const router = Router();

// note: the token contains the business id, so we can trust that the user is associated with the business
// we just need to check if the user has a business
// or if the user is an owner depending on the route
router.post(
  '/',
  authMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  bookingController.createBooking,
);
router.get(
  '/:id',
  authMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  bookingController.getBooking,
);
router.delete(
  '/:id',
  authMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  bookingController.deleteBooking,
);
router.get(
  '/',
  authMiddleware.authenticate,
  businessMiddleware.hasBusiness,
  bookingController.getBookingsWithFilter,
);

export default router;
