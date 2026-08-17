import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/environment.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import warehouseRoutes from './routes/warehouseRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

app.get('/health', (req, res) => res.json({ status: 'ok', env: env.nodeEnv }));

// Authentication & Authorization
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// Dashboard
app.use('/api/dashboard', dashboardRoutes);

// Warehouse Operations
app.use('/api/warehouse', warehouseRoutes);

// Orders & Returns
app.use('/api/orders', orderRoutes);
app.use('/api/returns', orderRoutes); // Returns routes are in orderRoutes

// Suppliers
app.use('/api/suppliers', supplierRoutes);

// Future modules to be implemented:
// app.use('/api/products', productRoutes);
// app.use('/api/inventory', inventoryRoutes);
// app.use('/api/sales', salesRoutes);
// app.use('/api/reports', reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
