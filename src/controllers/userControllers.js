import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

export const getJoin = (req, res) => {
  return res.render("user/join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
  const {
    body: { name, userId, password, password2, email, location, avatarUrl },
  } = req;
  if (password !== password2) {
    req.flash("error", "비밀번호가 일치하지 않습니다");
    return res.status(400).redirect("/join");
  }
  const exists = await User.exists({
    $or: [{ userId }, { email }],
  });
  if (exists) {
    req.flash("error", "해당 아이디 또는 이메일로 가입된 계정이 존재합니다");
    return res.status(400).redirect("/join");
  }
  try {
    await User.create({
      avatarUrl:
        "https://jutube-a.s3.amazonaws.com/images/25406be95c33217e849ef0393fb6f627",
      name,
      userId,
      password,
      email,
      location,
    });
    return res.redirect("/login");
  } catch (err) {
    req.flash("error", "알 수 없는 에러가 발생했습니다");
    return res.status(400).redirect("/join");
  }
};

export const getLogin = (req, res) => {
  return res.render("user/login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const {
    body: { userId, password },
  } = req;
  const user = await User.findOne({ userId, socialOnly: false });
  if (!user) {
    req.flash("error", "존재하지 않는 아이디입니다");
    return res.status(400).redirect("/login");
  }
  const greenLight = await bcrypt.compare(password, user.password);
  if (!greenLight) {
    req.flash("error", "잘못된 비밀번호입니다");
    return res.status(400).redirect("/login");
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.login,
        userId: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/");
    }
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  console.log(req.session);
  req.session.destroy();
  console.log(req.session);
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("user/edit", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { name, email, userId, location },
    file,
  } = req;
  const isHeroku = process.env.NODE_ENV === "production";
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file
        ? isHeroku
          ? file.location
          : file.path
        : "https://jutube-a.s3.us-east-2.amazonaws.com/images/25406be95c33217e849ef0393fb6f627",
      name,
      email,
      userId,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  req.flash("info", "프로필이 업데이트 되었습니다");
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "SNS로 로그인하셨습니다");
    return res.redirect("/");
  }
  return res.render("user/password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    body: { password0, password1, password2 },
    session: {
      user: { _id },
    },
  } = req;
  const user = await User.findById(_id);
  const match = await bcrypt.compare(password0, user.password);
  if (!match) {
    req.flash("error", "현재 비밀번호가 일치하지 않습니다");
    return res.status(400).redirect("/users/password");
  }
  if (password1 !== password2) {
    req.flash("error", "비밀번호 확인값이 일치하지 않습니다");
    return res.status(400).redirect("/users/password");
  }
  req.flash("info", "비밀번호를 변경했습니다");
  user.password = password1;
  await user.save();
  return res.redirect("/users/password");
};

export const profile = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("template/404", { pageTitle: "NO User" });
  }
  return res.render("user/profile", { pageTitle: user.name, user });
};
