import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types/authTypes';
import WorkerService from '../services/worker.service';

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
    
            res.json({ 
                status: 'success', 
                data: worker 
            });
        } catch (error) {
            next(error);
        }
    }
}

export default workerController;