import { Request, Response, NextFunction } from 'express';
import BusinessService from '../services/business.service';
import { JwtPayload } from '../types/authTypes';
import Stripe from 'stripe';
import { AppError } from '../utils/error';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' });

const businessController = {
    createBusiness: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction
        ): Promise<void> => {
        try {
            const userId = req.user!.userId;

            const { name } = req.body;
            // to-do: implement stripe integration to handle payments
            // and set the license expiration date based on the payment success
            const licenseExpirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

            //returns new access token with the business ID associated
            const { business, newAccessToken } = await BusinessService.createBusiness( 
            userId,
            name,
            licenseExpirationDate // Convert to Date if it comes as a string
            );

            res.status(201).json({ status: 'success', data: business, accessToken: newAccessToken});
        } catch (error) {
            next(error);
        }
    },

    createCheckoutSession: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const userId = req.user!.userId;

    
          const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{
              price: 'price_1QucKT7GwWoprFHLDjUGMIJE', // Stripe Price ID
              quantity: 1,
            }],
            success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:5173/business/create',
            metadata: { userId },
          });
    
          res.json({ status: 'success', data: { sessionId: session.id } });
        } catch (error) {
          next(error)
        }
      },

      handleWebhook: async (
        req: Request,
        res: Response
         ): Promise<void> => {
        const sig = req.headers['stripe-signature'] as string;
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
          console.log('Webhook event:', event.type, 'ID:', event.id);
        } catch (err) {
          console.error('Signature verification failed:', err);
          throw new AppError(400, 'Webhook signature verification failed');
        }
    
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('Session:', session.id, 'Status:', session.payment_status);
          if (session.payment_status !== 'paid') {
            throw new AppError(400, 'Payment not completed');
          }
    
          const userId = session.metadata?.userId;
          if (!userId) {
            throw new AppError(400, 'User ID not found in session metadata');
          }
    
          const existingBusiness = await BusinessService.getBusinessByUserId(userId);
    
          if (existingBusiness) {
            // Extend existing business
            const extendedBusiness = await BusinessService.extendBusinessExpiration(userId, 30);
            console.log(
              'Business expiration extended for user:',
              userId,
              'New expiration:',
              extendedBusiness.licenseExpirationDate
            );
          } else {
            // Create new business
            const licenseExpirationDate = new Date();
            licenseExpirationDate.setDate(licenseExpirationDate.getDate() + 30);
            const newBusiness = await BusinessService.createBusiness(
              userId,
              `Business-${userId}`, // Placeholder name
              licenseExpirationDate
            );
            console.log(
              'Business created for user:',
              userId,
              'Expiration:',
              newBusiness.business.licenseExpirationDate
            );
          }

        }
    
        res.status(200).end(); // Stripe requires 200
      },
};

export default businessController;