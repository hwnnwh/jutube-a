const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("muteBtn");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeBar = document.getElementById("volumeBar");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const timeline = document.getElementById("timeline");
const videoContainer = document.getElementById("videoContainer");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const fullscreenBtnIcon = fullscreenBtn.querySelector("i");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let mouseMoveTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const formatTime = (seconds) => {
  if (seconds < 3600) {
    return new Date(seconds * 1000).toISOString().substr(14, 5);
  }
  return new Date(seconds * 1000).toISOString().substr(11, 8);
};

const handlePlay = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.className = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMute = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeBar.value = video.muted ? 0 : volumeValue;
};

const handleVolume = (event) => {
  const {
    target: { value },
  } = event;
  muteBtnIcon.classList =
    volumeBar.value === "0" ? "fas fa-volume-off" : "fas fa-volume-up";
  volumeValue = video.volume = value;
};

const handleLoadedMetadata = () => {
  duration.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeupdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimeline = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullscreen = () => {
  const isFull = document.fullscreenElement;
  console.log(isFull);
  if (isFull) {
    document.exitFullscreen();
    fullScreenBtn.className = "fas fa-expand";
  } else {
    // videoContainer.requestFullscreen();
    video.requestFullscreen();
    fullScreenBtn.className = "fas fa-compress";
  }
};

const handleKeyboard = (event) => {
  if (event.key === " ") {
    handlePlay();
  } else if (event.key === "f") {
    video.requestFullscreen();
    fullScreenBtn.className = "fas fa-compress";
  } else if (event.key === "Escape") {
    document.exitFullscreen();
    fullScreenBtn.className = "fas fa-expand";
  }
};

const hideControls = () => {
  videoControls.classList.remove("showing");
};

const handleMousemove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (mouseMoveTimeout) {
    clearTimeout(mouseMoveTimeout);
    mouseMoveTimeout = null;
  }
  videoControls.classList.add("showing");
  mouseMoveTimeout = setTimeout(hideControls, 3000);
};

const handleMouseleave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
};

//control
playBtn.addEventListener("click", handlePlay);
video.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);
volumeBar.addEventListener("input", handleVolume);
timeline.addEventListener("input", handleTimeline);
fullscreenBtn.addEventListener("click", handleFullscreen);
//meta
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeupdate);
//device
video.addEventListener("keyup", handleKeyboard);
videoContainer.addEventListener("mousemove", handleMousemove);
videoContainer.addEventListener("mouseleave", handleMouseleave);

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/views`, {
    method: "POST",
  });
};

video.addEventListener("ended", handleEnded);
