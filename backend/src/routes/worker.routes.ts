import { Router } from 'express';
import workerController from '../controllers/worker.controller';
import tokenMiddleware from '../middlewares/token.middleware';
import businessMiddleware from '../middlewares/business.middleware';

const router = Router();

router.post(
    '/createWorker',
    tokenMiddleware.authenticate,
    businessMiddleware.isBusinessOwner,
    workerController.createWorker,
);