import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";

const chatRouter = Router();

chatRouter.get(
  '/room/all',
  authMiddleware,
);