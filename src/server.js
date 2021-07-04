import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "express-flash";
import { localsMiddleware } from "./middlewares";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger);
app.use(flash());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    }),
    cookie: { maxAge: 3600000 },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(localsMiddleware);
app.use("/static", express.static("assets"));
app.use("/img", express.static("img"));
app.use("/uploads", express.static("uploads"));

app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
