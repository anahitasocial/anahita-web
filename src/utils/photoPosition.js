// Where a photo was taken, read from its own metadata in this browser, for
// suggesting locations near it (roadmap row 82, part 5). Only ever used when
// the person asks, once, as the point of one search for nearby locations:
// never shown, never kept, never sent anywhere else. The file uploaded is
// the file chosen, and the server strips its metadata as it always has.
//
// exifr is loaded only when a photo is picked, so it costs nothing until
// then.

// How much of a photo is read: its metadata is at the start.
const HEAD_BYTES = 256 * 1024;

// Kept to four decimals, about 11 m: as near as a search for locations
// need be.
const round = (value) => {
  return Math.round(value * 10000) / 10000;
};

const isPoint = (latitude, longitude) => {
  return Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180 &&
    !(latitude === 0 && longitude === 0);
};

// The position of the first of these files that has one, or null.
const read = async (files = []) => {
  const images = files.filter((file) => {
    return file && /^image\//.test(file.type || '');
  });
  if (images.length === 0) {
    return null;
  }
  let exifr;
  try {
    exifr = await import('exifr');
  } catch (e) {
    return null;
  }
  const gps = exifr.gps || (exifr.default && exifr.default.gps);
  // eslint-disable-next-line no-restricted-syntax
  for (const file of images) {
    try {
      // The start of it only, where the position is: a photo can be
      // tens of megabytes, and none of the rest is needed.
      // eslint-disable-next-line no-await-in-loop
      const found = await gps(await file.slice(0, HEAD_BYTES).arrayBuffer());
      if (found && isPoint(found.latitude, found.longitude)) {
        return { latitude: round(found.latitude), longitude: round(found.longitude) };
      }
    } catch (e) {
      // No position in this one, or one that cannot be read: the next.
    }
  }
  return null;
};

export default {
  read,
};
