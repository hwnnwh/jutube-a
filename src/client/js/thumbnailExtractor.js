// import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import regneratorRuntime from "regenerator-runtime";

const uploadForm = document.getElementById("uploadForm");

// const thumbnailExtract = async () => {
//   const ffmpeg = createFFmpeg({ log: true });
//   await ffmpeg.load();
//   await ffmpeg.run(
//     "-i",
//     String(newVideo),
//     "-ss",
//     "00:00:01",
//     "-frmaes:v",
//     1,
//     "thumbnail.jpg"
//   );
//   const thumbFile = ffmpeg.FS("readFile", "thumbnail.jpg");
//   const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });
//   const thumbUrl = URL.createObjectURL(thumbBlob);
//   const a = document.createElement("a");
//   a.href = thumbUrl;
//   a.download = "thumbnail.jpg";
//   document.body.appendChild(a);
//   a.click();
//   ffmpeg.FS("unlink", "thumbnail.jpg");
//   URL.revokeObjectURL(thumbUrl);
// };

const handleUploadForm = async () => {
  const response = await fetch("/api/videos/upload/thumbnail", {
    method: "GET",
  });
  if (response.status === 201) {
    const { path } = await response.json();
    console.log(path);
  }
};
