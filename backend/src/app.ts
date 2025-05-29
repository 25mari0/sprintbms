import 'express-async-errors'; 
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
import AppDataSource from './db/data-source';
import errorHandler from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import bookingRoutes from './routes/booking.routes';
import cookieParser from 'cookie-parser';
import customerRoutes from './routes/customer.routes';
import businessRoutes from './routes/business.routes';
import serviceRoutes from './routes/service.routes';
import workerRoutes from './routes/worker.routes';
import multer from 'multer';
import cors from 'cors';
import redisClient from './config/redis';
import { cacheManager } from './services/cache-manager.service';

dotenv.config();

const app = express();

// Apply express.json() globally, but skip /business/webhook
app.use((req, res, next) => {
  if (req.path === '/business/webhook') {
    return next(); // Skip JSON parsing for webhook
  }
  express.json()(req, res, next); // Parse JSON for other routes
});

// for multipart/form-data, multer can be used
const upload = multer(); // for parsing multipart/form-data
app.use(upload.none()); // file upload's are not expected

const PORT = process.env.PORT;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.set('trust proxy', true);

app.use(cors({
  origin: process.env.FRONTEND_URL, // allow only our frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // specify allowed methods
  credentials: true, // allow cookies/credentials if needed (e.g., JWT in cookies)
  exposedHeaders: ['Authorization'], // Expose only what's necessary
}));

app.use(cookieParser());
app.use('/bookings', bookingRoutes, limiter);
app.use('/client', authRoutes, limiter);
app.use('/customer', customerRoutes, limiter);
app.use('/business', businessRoutes, limiter);
app.use('/services', serviceRoutes, limiter);
app.use('/worker', workerRoutes, limiter);

app.use(errorHandler);

// Redis initialization function
const initializeRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis initialized successfully');
    
    // Optional: Perform initial cache maintenance
    // await cacheManager.performMaintenance();
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    // Decide whether to exit or continue without Redis
    // For production, you might want to exit
    // process.exit(1);
  }
};

// Optional: Add scheduled maintenance (run daily)
const scheduleMaintenanceTasks = () => {
  setInterval(async () => {
    try {
      await cacheManager.performMaintenance();
    } catch (error) {
      console.error('Cache maintenance failed:', error);
    }
  }, 24 * 60 * 60 * 1000); // Daily maintenance
};

// retry logic for TypeORM initialization
const connectWithRetry = async () => {
  let retries = 10;
  while (retries) {
    try {
      await AppDataSource.initialize();
      console.log('DataSource has been initialized!');
      break;
    } catch (err) {
      console.error('Error during DataSource initialization, retrying...', err);
      retries -= 1;
      await new Promise((res) => setTimeout(res, 5000)); // wait 5 seconds before retrying
    }
  }
  if (!retries) {
    console.error('Could not initialize DataSource after multiple attempts.');
    process.exit(1); // exit the process if connection fails after retries
  }
};

// Initialize services in the correct order
const initializeServices = async () => {
  // 1. Initialize database first
  await connectWithRetry();
  
  // 2. Initialize Redis
  await initializeRedis();
  
  // 3. Schedule maintenance tasks
  scheduleMaintenanceTasks();
};

// Call initialization
initializeServices();

app.get('/', (req, res) => {
  res.send('API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
