import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/health/db', async (req, res) => {
  const { error } = await supabase.auth.admin.listUsers({ perPage: 1 });
  if (error) return res.status(500).json({ db: 'error', message: error.message });
  res.json({ db: 'ok' });
});

app.listen(process.env.PORT, () =>
  console.log(`Server chạy tại http://localhost:${process.env.PORT}`)
);
