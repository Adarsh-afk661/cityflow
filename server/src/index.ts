import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { router as apiRouter } from './routes/api.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    app: 'CityFlow Route Intelligence API',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// Initialize MongoDB & start listening
const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CityFlow Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[CityFlow Server] API Health: http://0.0.0.0:${PORT}/api/health`);
  });
};

startServer();
