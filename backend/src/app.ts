import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';           
import { errorMiddleware } from './middlewares/errorMiddleware.js'
import pool from './config/db.js'
import { sessionCookieMiddleware } from "./middlewares/sessionMiddleware.js";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
  })
);
app.use(morgan('dev'));
app.use(express.json()); 
app.use(cookieParser());

app.use(sessionCookieMiddleware);

pool.connect((err,client, release) => {
    if (err) {
      console.error('Database connection failed:', err.stack);
    } else {
      console.log('Database connected successfully');
    }
    release(); 
  });
// routes
app.use('/api', routes); 

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Hello Asymptotes');
});

app.use(errorMiddleware);

export default app;