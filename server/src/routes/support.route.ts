import express from 'express';
import { SupportController } from '../controller/support.controller';
const supportRouters = express.Router();

supportRouters.post('/set-support-link', SupportController.setSupportLink);
supportRouters.get('/get-support-link', SupportController.getSupportLink);

export default supportRouters;
