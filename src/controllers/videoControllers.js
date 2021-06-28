import Video from "../models/Video";

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ creationTime: "desc" });
  res.render("video/home", { pageTitle: "HOME", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("template/404", { pageTitle: "404" });
  } else {
    return res.render("video/watch", { pageTitle: "Watch", video });
  }
};

export const getUpload = async (req, res) => {
  return res.render("video/upload", { pageTitle: "Upload" });
};

export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  try {
    const video = await Video.create({
      title,
      description,
      creationTime: Date.now(),
      hashtags: Video.formatHashtags(hashtags),
      meta: {
        views: 0,
        likes: 0,
      },
    });
    return res.redirect("/");
  } catch (err) {
    return res.status(400).render("video/upload", {
      pageTitle: "Upload",
      errMessage: error._message,
    });
  }
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res
      .status(404)
      .render("template/404", { pageTitle: "404 NOT FOUND" });
  } else {
    return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
  }
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    body: { title, description, hashtags },
  } = req;
  const exists = await Video.exists({ _id: id });
  if (!exists) {
    return res
      .status(404)
      .render("template/404", { pageTitle: "404 NOT FOUND" });
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags,
  });
  return res.redirect(`/videos/${id}`);
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findByIdAndDelete(id);
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
    });
  }
  return res.render("video/search", { pageTitle: "Search", videos });
};
