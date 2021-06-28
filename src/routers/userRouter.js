import express from "express";
import { edit, profile } from "../controllers/userControllers";

const userRouter = express.Router();

userRouter.get("/edit", edit);
userRouter.get("/:id", profile);

export default userRouter;
