const fs = require('fs');
const path = require('path');
const { ffmpeg, toAudio, toPTT, toVideo } = require('../all/converter');
const myfunc = require('./myfunc'); // has getBuffer
const allMyfunc = require('../all/myfunc'); // has getSizeMedia, smsg

// Simple wrapper to convert image buffer to webp using ffmpeg helper
async function imageToWebp(buffer) {
  if (!Buffer.isBuffer(buffer)) throw new Error('imageToWebp expects a Buffer');
  // use ffmpeg helper: input ext 'jpg' and output ext 'webp'
  const args = [
    '-vcodec', 'libwebp',
    '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
    '-lossless', '0',
    '-qscale', '50',
    '-preset', 'default',
    '-an',
    '-vsync', '0'
  ];
  return ffmpeg(buffer, args, 'jpg', 'webp');
}

// Convert a video buffer to webp (animated sticker). Uses ffmpeg to convert to webp.
async function videoToWebp(buffer) {
  if (!Buffer.isBuffer(buffer)) throw new Error('videoToWebp expects a Buffer');
  const args = [
    '-vcodec', 'libwebp',
    '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
    '-lossless', '0',
    '-qscale', '50',
    '-preset', 'default',
    '-loop', '0',
    '-an',
    '-vsync', '0'
  ];
  return ffmpeg(buffer, args, 'mp4', 'webp');
}

// writeExif placeholders: for now just return converted webp (no EXIF embed)
async function writeExifImg(buffer, options = {}) {
  if (options && (options.packname || options.author)) {
    console.warn('writeExifImg: EXIF embedding (packname/author) is not implemented; returning webp buffer without metadata.');
  }
  return imageToWebp(buffer);
}

async function writeExifVid(buffer, options = {}) {
  if (options && (options.packname || options.author)) {
    console.warn('writeExifVid: EXIF embedding (packname/author) is not implemented; returning webp buffer without metadata.');
  }
  return videoToWebp(buffer);
}

// generic writeExif alias
const writeExif = async (buffer, options = {}) => {
  // decide by mime or by buffer content (naive)
  // If options.isVideo === true use video writer
  if (options && options.isVideo) return writeExifVid(buffer, options);
  return writeExifImg(buffer, options);
};

// small wrappers for audio/video conversions
module.exports = {
  smsg: allMyfunc.smsg,
  imageToWebp,
  videoToWebp,
  writeExif,
  writeExifImg,
  writeExifVid,
  toAudio,
  toPTT,
  toVideo,
  getBuffer: myfunc.getBuffer,
  getSizeMedia: allMyfunc.getSizeMedia
};