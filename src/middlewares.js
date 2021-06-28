export const localsMiddleware = (req, res, next) => {
  res.locals.serviceName = "Jutube";
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user;

  next();
};
