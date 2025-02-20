import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types/authTypes';
import WorkerService from '../services/worker.service';
import workerService from '../services/worker.service';

const workerController = {
    createWorker: async (
        req: Request  & { user?: JwtPayload },
        res: Response,
        next: NextFunction,
      ): Promise<void> => {
        try {
            const { name, email } = req.body;
            const businessId = req.user!.business!.id;
    
            const worker = await WorkerService.addWorker(
                businessId,
                name,
                email
            );
    
            res.status(200).json({ 
                status: 'success', 
                data: worker 
            });
        } catch (error) {
            next(error);
        }
    },

    resetWorkerPassword: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const workerId = req.params.userId;
          const ownerId = req.user!.userId;
      
          await workerService.resetWorkerPassword(ownerId, workerId);
      
          res.status(200).json({
            status: 'success',
            message: 'Temporary password reset link sent to worker\'s email',
          });
        } catch (error) {
          next(error);
        }
    },

    resendWorkerWelcome: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const workerId = req.params.userId;
          const ownerId = req.user!.userId;
      
          await workerService.resendWorkerWelcome(ownerId, workerId);
      
          res.status(200).json({
            status: 'success',
            message: 'Verification link sent to worker\'s email',
          });
        } catch (error) {
          next(error);
        }
    },

    suspendWorker: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const workerId = req.params.userId;
          const ownerId = req.user!.userId;
      
          await workerService.suspendWorker(ownerId, workerId);
      
          res.status(200).json({
            status: 'success',
            message: 'Worker suspended',
          });
        } catch (error) {
          next(error);
        }
    },

    reactivateWorker: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const workerId = req.params.userId;
          const ownerId = req.user!.userId;
      
          await workerService.reactivateWorker(ownerId, workerId);
      
          res.status(200).json({
            status: 'success',
            message: 'Worker reactivated',
          });
        } catch (error) {
          next(error);
        }
    }
};

export default workerController;