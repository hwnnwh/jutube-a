import User from "../models/User";
import bcrypt from "bcrypt";

export const edit = (req, res) => {
  res.end();
};

export const profile = (req, res) => {
  res.send("user profile");
};

export const getJoin = (req, res) => {
  return res.render("user/join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
  const {
    body: { name, userId, password, password2, email, location },
  } = req;
  const pageTitle = "Join";
  const exists = User.exists({ $or: [{ userId }, { email }] });
  if (password !== password2) {
    return res.status(400).render("user/join", {
      pageTitle,
      errMessage: "패스워드가 일치하지 않습니다",
    });
  } else if (exists) {
    return res.status(400).render("user/join", {
      pageTitle,
      errMessage: "이미 등록된 계정입니다",
    });
  }
  try {
    await User.create({
      name,
      userId,
      password,
      emial,
      location,
    });
    return res.redirect("/login");
  } catch (err) {
    return res
      .status(400)
      .render("/join", { pageTitle, errMessage: err._message });
  }
};

export const getLogin = (req, res) => {
  return res.render("user/login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const {
    body: { userId, password },
  } = req;
  const pageTitle = "Login";
  const user = await User.findOne({ userId });
  const greenLight = await bcrypt.compare(password, user.password);
  if (!user) {
    return res.status(400).render("user/login", {
      pageTitle,
      errMessage: "존재하지 않는 아이디입니다",
    });
  }
  if (!greenLight) {
    return res.status(400).render("user/login", {
      pageTitle,
      errMessage: "잘못된 비밀번호입니다",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};
