import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { supabase } from './config/supabase.js';
import authRoutes from './routes/auth.js';
import garageRoutes from './routes/garage.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/health/db', async (req, res) => {
  const { error } = await supabase.auth.admin.listUsers({ perPage: 1 });
  if (error) return res.status(500).json({ db: 'error', message: error.message });
  res.json({ db: 'ok' });
});

app.use('/api', authRoutes);
app.use('/api', garageRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server chạy tại http://localhost:${process.env.PORT}`)
);
