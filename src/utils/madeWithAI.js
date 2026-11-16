// Whether a picture or a video says it was made with AI (anahita-services
// row 122, phase 5): the two plain signs, IPTC's digital source type
// `trainedAlgorithmicMedia` or `compositeWithTrainedAlgorithmicMedia`, in
// its XMP or in a C2PA manifest's actions. Both are written as the same
// words, so a file is searched for them. Nobody gains by faking that against
// themselves, so it is believed; a file that does not say so proves nothing,
// and no guess is made from what it shows.
//
// Read here, in the browser, as the file is chosen: a video goes from here
// straight to storage, and a photo's signs are gone once it is made again
// at its sizes. Where the signs are kept: a JPEG's at its start, a video's
// at its start or its end; a large file is read at both ends alone.

const SIGN = /trainedalgorithmicmedia/i;
const WHOLE = 8 * 1024 * 1024;
const END = 4 * 1024 * 1024;

const textOf = (blob) => {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer().then((buffer) => {
      return new TextDecoder('latin1').decode(buffer);
    });
  }
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onload = () => { resolve(reader.result); };
    reader.onerror = reject;
    reader.readAsBinaryString(blob);
  });
};

const partsOf = (file) => {
  if (file.size <= WHOLE) {
    return [file];
  }
  return [file.slice(0, END), file.slice(file.size - END)];
};

// Whether one file says so.
const says = (file) => {
  if (!file || typeof file.slice !== 'function') {
    return Promise.resolve(false);
  }
  return Promise.all(partsOf(file).map(textOf)).then((texts) => {
    return texts.some((text) => { return SIGN.test(text); });
  }).catch(() => {
    return false;
  });
};

// Whether any of them says so.
const any = (files) => {
  return Promise.all(Array.from(files || []).map(says)).then((answers) => {
    return answers.some(Boolean);
  });
};

export default {
  says,
  any,
};
