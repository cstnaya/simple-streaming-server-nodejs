const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/video", (req, res) => {
  // get the range that user requested.
  // parse range example: "bytes=13161-"
  const range = req.headers.range;
  if (!range) {
    return res.status(400).send({ error: "Range in headers is required." });
  }

  // get the full size of the video.
  const video = "birthday.mp4";
  const videoSize = fs.statSync(path.join(__dirname, video)).size; // in bytes

  // determine the parse range
  // At here, I want to give the range as 1/8 video size
  const chunkSize = Math.round(videoSize / 8); // 1 mega bytes

  // determine which part of video you want to send
  const start = +range.replace(/\D/g, "");
  const end = Math.min(start + chunkSize, videoSize - 1);

  // create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers); // 206 => means partial content

  // create video stream for this partial chunk
  const videoStream = fs.createReadStream(video, { start, end });
  videoStream.pipe(res);
});

app.listen(8000, () => {
  console.log("app listening on port 8000");
});
