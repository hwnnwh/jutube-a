import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ creationTime: "desc" })
    .populate("owner");
  return res.render("video/home", { pageTitle: "HOME", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id)
    .populate("owner")
    .populate({
      path: "comments",
      populate: {
        path: "owner",
        model: "User",
      },
    });
  if (!video) {
    return res.render("template/404", { pageTitle: "404" });
  } else {
    console.log(video.comments.owner);
    return res.render("video/watch", { pageTitle: "Watch", video });
  }
};

export const getUpload = async (req, res) => {
  return res.render("video/upload", { pageTitle: "Upload" });
};

export const thumbnail = (req, res, next) => {
  const { id } = req.body;
  const newVideo = Video.findById(id);
};

export const postUpload = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { title, description, hashtags },
    file: { location },
  } = req;
  const isHeroku = process.env.NODE_ENV === "production";
  try {
    const newVideo = await Video.create({
      fileUrl: location,
      title,
      description,
      creationTime: Date.now(),
      hashtags: Video.formatHashtags(hashtags),
      owner: _id,
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (err) {
    req.flash("error", "오류가 발생했습니다. 다시 시도하세요");
    return res.status(400).redirect("/videos/upload");
  }
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.session.user;
  const video = await Video.findById(id);
  if (!video) {
    return res
      .status(404)
      .render("template/404", { pageTitle: "404 NOT FOUND" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "권한이 없습니다");
    return res.status(403).redirect("/");
  }
  return res.render("video/edit", {
    pageTitle: `Edit ${video.title}`,
    video,
  });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    session: {
      user: { _id },
    },
    body: { title, description, hashtags },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res
      .status(404)
      .render("template/404", { pageTitle: "404 NOT FOUND" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "권한이 없습니다");
    return res.status(403).rendirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.session.user;
  const video = await Video.findById(id);
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "영상의 게시자만 영상을 삭제할 수 있습니다");
    return res.status(403).redirect(`/videos/${id}`);
  }
  await Video.findByIdAndDelete(id);
  const user = await User.findById(_id);
  const newVideos = user.videos.filter(
    (element) => String(element._id) !== String(id)
  );
  user.videos = newVideos;
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(`${keyword}`, "i"),
      },
    }).populate("owner");
  }

  return res.render("video/search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    params: { id },
    session: { user },
    body: { text },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  const commentWriterId = comment.owner._id;
  const commentWriter = await User.findById(commentWriterId);
  commentWriter.comments.push(comment._id);
  commentWriter.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
      user,
    },
  } = req;
  const comment = await Comment.findById(id).populate("owner");
  if (!comment) {
    return res
      .status(404)
      .render("template/404", { pageTitle: "404 NOT FOUND" });
  }
  const targetUser = await User.findById(_id);
  if (String(comment.owner._id) === String(_id)) {
    await Comment.findByIdAndDelete(id);
    const newComments = targetUser.comments.filter(
      (element) => String(comment.id) !== String(element._id)
    );
    targetUser.comments = newComments;
    targetUser.save();
    return res.sendStatus(204);
  }
};
