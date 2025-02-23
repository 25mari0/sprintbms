// backend/src/routes/booking.routes.ts
import { Router } from 'express';
import bookingController from '../controllers/booking.controller';
import tokenMiddleware from '../middlewares/token.middleware';
import premiumMiddleware from '../middlewares/premium.middleware';

const router = Router();

// note: the token contains the business id, so we can trust that the user is associated with the business
// we just need to check if the user has a business
// or if the user is an owner depending on the route
router.post(
  '/',
  tokenMiddleware.authenticate,
  premiumMiddleware.isPremium,
  bookingController.createBooking,
);
router.get(
  '/:id',
  tokenMiddleware.authenticate,
  premiumMiddleware.isPremium,
  bookingController.getBooking,
);
router.delete(
  '/:id',
  tokenMiddleware.authenticate,
  premiumMiddleware.isPremium,
  bookingController.deleteBooking,
);
router.get(
  '/',
  tokenMiddleware.authenticate,
  premiumMiddleware.isPremium,
  bookingController.getBookingsWithFilter,
);

export default router;
