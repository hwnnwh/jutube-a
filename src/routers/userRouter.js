import express from "express";
import {
  startGithubLogin,
  finishGithubLogin,
  logout,
  getEdit,
  postEdit,
  profile,
  getChangePassword,
  postChangePassword,
} from "../controllers/userControllers";
import {
  loginOnlyMiddleware,
  publicOnlyMiddleware,
  avatarUpload,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/logout", loginOnlyMiddleware, logout);
userRouter
  .route("/edit")
  .all(loginOnlyMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
userRouter
  .route("/password")
  .all(loginOnlyMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.route("/:id([0-9a-f]{24})").get(profile);

export default userRouter;
