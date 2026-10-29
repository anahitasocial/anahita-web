// A photo made ready in the browser before it is sent: no larger than the
// largest size the site keeps, the right way up, and a JPEG or a PNG,
// which is all photo-service takes (the services' docs/photos.md).
//
// So a 12-megapixel photo from a phone goes as a tenth of its weight, and
// an iPhone's HEIC, which the pickers ask for by name so that the phone
// hands it over at once instead of converting it first, is made a JPEG
// here (roadmap row 112, docs/plans/composer-on-a-phone.md). A browser
// that cannot read a file sends it as it is, and the server says why it
// will not take it. What a photo carries of where it was taken is read
// from the original before this (utils/photoPosition), and is not sent.

// The longest side the site keeps: `original` and `xxlarge`.
export const LONGEST = 2048;

// What the pickers ask for, and what is taken when dropped.
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];

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
  if (!size.scaled && !isHeic(file) && ['image/jpeg', 'image/png'].includes(file.type)) {
    picture.close();
    return file;
  }
  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
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
