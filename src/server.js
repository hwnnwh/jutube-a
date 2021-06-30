import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import { localsMiddleware } from "./middlewares";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const app = express();

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    }),
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/static", express.static("assets"));
app.use("/uploads", express.static("uploads"));
app.use(localsMiddleware);

app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
