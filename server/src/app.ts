import express from 'express';
import cors from 'cors';
import userRouters from './routes/user.route';
import supportRouters from './routes/support.route';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', userRouters);
app.use('/support', supportRouters);
