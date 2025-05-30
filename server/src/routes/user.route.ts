import express from 'express';
import { UserController } from '../controller/user.controller';

const userRouters = express.Router();

userRouters.post('/create', UserController.createUser); // POST /users/
userRouters.get('/:telegramId', UserController.getUserByTelegramId); // GET /users/:telegramId
userRouters.patch('/:telegramId/admin', UserController.giveAdmin); // PATCH /users/:telegramId/admin
userRouters.patch('/:telegramId/revoke-admin', UserController.revokeAdmin); // PATCH /users/:telegramId/revoke-admin
// userRouters.patch('/:telegramId/access-for-me', UserController.GetAccessForMe);
userRouters.patch('/:telegramId/link-trader', UserController.linkTraderId);
userRouters.patch('/:telegramId/add-access', UserController.GetAccessForUserID);
userRouters.patch('/:telegramId/revoke-access', UserController.RevokeAccessForID);
userRouters.get('/qountexId/:qountexId', UserController.getInfoByQountexId);
userRouters.post('/test', UserController.handlePostback);
export default userRouters;
