// A photo made ready in the browser before it is sent: no larger than the
// largest size the site keeps, and the right way up. photo-service takes
// JPEG, PNG, WebP, HEIC and AVIF, and keeps each as a JPEG or a PNG (the
// services' docs/photos.md, roadmap row 135).
//
// So a 12-megapixel photo from a mobile goes as a tenth of its weight, and
// an iPhone's HEIC, which the pickers ask for by name so that the mobile
// hands it over at once instead of converting it first, is made a JPEG
// here where the browser can read it (roadmap row 112,
// docs/plans/done/composer-on-a-mobile.md). A browser that cannot sends it
// as it is, and the server makes it a JPEG; the preview is then what the
// server made (PhotoFilesEditor). What a photo carries of where it was taken is read
// from the original before this (utils/photoPosition), and is not sent.

// The longest side the site keeps: `original` and `xxlarge`.
export const LONGEST = 2048;

// What the pickers ask for, and what is taken when dropped.
export const PHOTO_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif',
];

// What is sent as it is when it is no larger than is kept: what the server
// keeps as it is, and a WebP or an AVIF, which it makes a JPEG or a PNG
// itself, see-through parts kept.
const SENT_AS_IT_IS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const JPEG_QUALITY = 0.9;

// The size a picture is drawn at: its own, or scaled down so that its
// longest side is LONGEST.
export const sizeFor = (width, height, longest = LONGEST) => {
  const side = Math.max(width, height);
  if (!side || side <= longest) {
    return { width, height, scaled: false };
  }
  const by = longest / side;
  return {
    width: Math.round(width * by),
    height: Math.round(height * by),
    scaled: true,
  };
};

// The file's name with the extension of what it now is.
export const renamed = (name, type) => {
  const extension = type === 'image/png' ? 'png' : 'jpg';
  const base = String(name || 'photo').replace(/\.[^./]+$/, '');
  return `${base}.${extension}`;
};

const isHeic = (file) => {
  return /^image\/hei[cf]/.test(file.type) || /\.hei[cf]$/i.test(file.name || '');
};

const blobOf = (canvas, type) => {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, type === 'image/jpeg' ? JPEG_QUALITY : undefined);
  });
};

// The photo to send: the file itself where it is a JPEG or PNG no larger
// than is kept, and otherwise drawn again, scaled and turned upright. A
// PNG stays a PNG, which keeps what is see-through in it.
export const preparePhoto = async (file) => {
  if (!file || typeof window.createImageBitmap !== 'function') {
    return file;
  }
  let picture;
  try {
    picture = await window.createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file;
  }
  const size = sizeFor(picture.width, picture.height);
  if (!size.scaled && !isHeic(file) && SENT_AS_IT_IS.includes(file.type)) {
    picture.close();
    return file;
  }
  // A PNG or a WebP drawn again stays one that can be see-through.
  const type = ['image/png', 'image/webp'].includes(file.type) ? 'image/png' : 'image/jpeg';
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext('2d').drawImage(picture, 0, 0, size.width, size.height);
  picture.close();
  const blob = await blobOf(canvas, type);
  if (!blob) {
    return file;
  }
  return new File([blob], renamed(file.name, type), { type, lastModified: file.lastModified });
};

export default preparePhoto;
