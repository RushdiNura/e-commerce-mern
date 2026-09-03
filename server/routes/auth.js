import express from 'express';
import { verifyUser,authorize } from '../middleware/auth.js';
import { login, logout, register,getMe } from '../controllers/auth.js';
const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.get("/me",verifyUser,getMe)
router.post('/logout',verifyUser,logout);
export default router;