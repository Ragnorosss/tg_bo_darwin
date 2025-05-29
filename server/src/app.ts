import express from 'express';
import cors from 'cors';
import userRouters from './routes/user.route';
import supportRouters from './routes/support.route';
import dotenv from 'dotenv';

import bodyParser from 'body-parser';
dotenv.config();
export const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


app.use('/users', userRouters);
app.use('/support', supportRouters);
