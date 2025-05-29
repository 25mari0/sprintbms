import { Request, Response, NextFunction } from 'express';
import BusinessService from '../services/business.service';
import { JwtPayload } from '../types/authTypes';
import Stripe from 'stripe';
import { AppError } from '../utils/error';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' });

const businessController = {

    createCheckoutSession: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const userId = req.user!.userId;
          const businessName = req.body.businessName || undefined;
          const hasBusiness = await BusinessService.getBusinessByUserId(userId)

          if (!hasBusiness && !businessName)
            throw new AppError(400, 'Business name is missing')

          const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{
              price: 'price_1QucKT7GwWoprFHLDjUGMIJE', // stripe Price ID
              quantity: 1,
            }],
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/business/create?mode=${hasBusiness ? 'renew' : 'create'}`, // Preserve mode
            metadata: { 
                userId,
                ...(businessName && { businessName }), // add businessName if provided
             },
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
        } catch {
          throw new AppError(400, 'Webhook signature verification failed');
        }
    
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.payment_status !== 'paid') {
            throw new AppError(400, 'Payment not completed');
          }
    
          const userId = session.metadata?.userId;
          if (!userId) {
            throw new AppError(400, 'User ID not found in session metadata');
          }
    
          const businessName = session.metadata?.businessName; 
          const existingBusiness = await BusinessService.getBusinessByUserId(userId);
    
          if (existingBusiness) {
            // extend existing business
            await BusinessService.extendBusinessExpiration(userId, 30);

          } else {
            // create new business
            const licenseExpirationDate = new Date();
            licenseExpirationDate.setDate(licenseExpirationDate.getDate() + 30);
            await BusinessService.createBusiness(
              userId,
              businessName || `Business-${userId}`, // fallback for safety
              licenseExpirationDate
            );
          }

        }
    
        res.status(200).end(); // Stripe requires 200
      },
};

export default businessController;