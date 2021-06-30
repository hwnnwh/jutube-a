import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";

import fetch from "node-fetch";

export const getJoin = (req, res) => {
  return res.render("user/join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
  const {
    body: { name, userId, password, password2, email, location },
  } = req;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("user/join", {
      pageTitle,
      errMessage: "패스워드가 일치하지 않습니다",
    });
  }
  const exists = await User.exists({
    $or: [{ userId }, { email }],
  });
  if (exists) {
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
      email,
      location,
    });
    return res.redirect("/login");
  } catch (err) {
    console.log(err);
    console.log(err._message);
    return res
      .status(400)
      .render("user/join", { pageTitle, errMessage: err._message });
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
  const user = await User.findOne({ userId, socialOnly: false });
  if (!user) {
    return res.status(400).render("user/login", {
      pageTitle,
      errMessage: "존재하지 않는 아이디입니다",
    });
  }
  const greenLight = await bcrypt.compare(password, user.password);
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
    console.log(userData);
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
      user = User.create({
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
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("user/edit", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, userId, location },
    file,
  } = req;

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      userId,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
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
    return res.status(400).render("user/password", {
      pageTitle: "Change Password",
      errMessage: "현재 비밀번호가 일치하지 않습니다",
    });
  }
  if (password1 !== password2) {
    return res.status(400).render("user/password", {
      pageTitle: "Change Password",
      errMessage: "변경할 비밀번호와 비밀번호 확인 값이 일치하지 않습니다",
    });
  }
  user.password = password1;
  await user.save();
  return res.redirect("/users/logout");
};

export const profile = async (req, res) => {
  const { id } = req.params;
  const user = User.findById(id).populate("videos");
  if (!user) {
    return res
      .status(404)
      .render("template/404", { pageTitle: "USER NOT FOUND" });
  }
  return res.render("user/profile", { pageTitle: user.name, user });
};
