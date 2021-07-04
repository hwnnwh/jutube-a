import multer from "multer";
import aws from "aws-sdk";
import multerS3 from "multer-s3";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const multerUploader = multerS3({
  s3: s3,
  bucket: "jutube-a",
  acl: "public-read",
});

export const localsMiddleware = (req, res, next) => {
  res.locals.serviceName = "Jutube";
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user;
  next();
};

export const loginOnlyMiddleware = (req, res, next) => {
  if (req.session.loggedIn === true) {
    next();
  } else {
    req.flash("error", "로그인이 필요합니다");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (req.session.loggedIn !== true) {
    next();
  } else {
    req.flash("error", "접근할 수 없습니다");
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: { fileSize: "3000000" },
  storage: multerUploader,
});

export const videoUpload = multer({
  dest: "uploads/videos",
  limits: {
    fileSize: "10000000",
  },
  storage: multerUploader,
});
