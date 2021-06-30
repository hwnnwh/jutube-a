import multer from "multer";

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
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (req.session.loggedIn !== true) {
    next();
  } else {
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: { fileSize: "3000000" },
});

export const videoUpload = multer({
  dest: "uploads/videos",
  limits: {
    fileSize: "10000000",
  },
});
