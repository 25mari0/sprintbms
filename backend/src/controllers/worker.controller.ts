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
                message: 'Worker created successfully',
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

    setPassword: async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const { token, password } = req.body;
    
          await workerService.setPassword(token, password);
    
          res.status(200).json({
            status: 'success',
            message: 'Password updated successfully',
          });
        } catch (error) {
          next(error);
        }
    },


    resendWorkerPasswordReset: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const workerId = req.params.userId;
          const ownerId = req.user!.userId;
      
          await workerService.resendWorkerPasswordReset(ownerId, workerId);
      
          res.status(200).json({
            status: 'success',
            message: 'Password reset link sent to worker\'s email',
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
    },

    getWorker: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const workerId = req.params.userId;
          const ownerId = req.user!.userId;
      
          const worker = await workerService.getWorker(ownerId, workerId);
      
          res.status(200).json({
            status: 'success',
            data: worker,
          });
        } catch (error) {
          next(error);
        }
    },

    getWorkers: async (
        req: Request & { user?: JwtPayload },
        res: Response,
        next: NextFunction
      ): Promise<void> => {
        try {
          const businessId = req.user!.business!.id;
          const ownerId = req.user!.userId;
      
          const workers = await workerService.getWorkers(businessId, ownerId);
      
          res.status(200).json({
            status: 'success',
            data: workers,
          });
        } catch (error) {
          next(error);
        }
    }

};

export default workerController;