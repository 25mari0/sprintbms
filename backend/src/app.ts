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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'",
  );
  next();
});

app.use(cookieParser());
app.use('/bookings', bookingRoutes, limiter);
app.use('/client', authRoutes, limiter);
app.use('/customer', customerRoutes, limiter);
app.use('/business', businessRoutes, limiter);
app.use(errorHandler);

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

// call retry logic for DB connection
connectWithRetry();

app.get('/', (req, res) => {
  res.send('API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
