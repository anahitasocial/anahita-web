import { useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import api from '../api';
import i18n from '../languages';
import photoFiles from '../utils/photoFiles';
import { PHOTO_TYPES, preparePhoto } from '../utils/preparePhoto';

const { STATUS } = photoFiles;

// Why an upload was refused, in words. The server sends a short code.
const failureText = (error) => {
  const response = (error && error.response) || {};
  // Too large for the gateway is refused there, before the photo service
  // sees it, with the status and no code.
  const code = (response.data && response.data.error) ||
    (response.status === 413 ? 'file_too_large' : '');
  const known = {
    file_unsupported: 'photos:editor.unsupported',
    file_too_large: 'photos:editor.tooLarge',
    file_unreadable: 'photos:editor.unreadable',
  };
  return i18n.t(known[code] || 'photos:editor.failed');
};

// Whether this browser can draw the file as it was picked: not a HEIC,
// anywhere but Safari, which preparePhoto has then made a JPEG.
const canShow = (file) => {
  return !/^image\/hei[cf]/.test(file.type || '') && !/\.hei[cf]$/i.test(file.name || '');
};

// A photo, by what it says it is or, where a browser says nothing of an
// iPhone's HEIC, by its name.
const isPhoto = (file, supportedMimetypes) => {
  return supportedMimetypes.includes(file.type) ||
    (supportedMimetypes.includes('image/heic') && /\.hei[cf]$/i.test(file.name || ''));
};

// The photos of PhotoFilesEditor as they are picked and sent: what is
// taken, what is left out, each sent as soon as it is in and sent again
// when that failed. The list itself is the caller's (`items`, changed by
// `onChange` with a function from the list as it is to the list as it is
// to be); this keeps only what belongs to the files picked in this
// browser.
//
// It gives how many more there is room for, whether a video may be picked
// instead, how many of the last pick were left out, the dropzone's props
// for the add button, and `canRetry(key)` and `retry(key)` for a photo
// whose upload failed.
const usePhotoUploads = ({
  owner,
  items,
  onChange,
  max = photoFiles.DEFAULT_MAX,
  supportedMimetypes = PHOTO_TYPES,
  disabled = false,
  videoMimetypes = [],
  onVideo = null,
  onPicked = null,
  incoming = null,
  onIncomingTaken = null,
}) => {
  // How many photos of the last pick did not fit. The system's own file
  // window cannot be told how many to allow, so somebody can pick more
  // than a post holds; the extra ones are left out and this says so.
  const [leftOut, setLeftOut] = useState(0);

  // The browser's own addresses for the picked files, let go of when this
  // goes away so the files are not held in memory.
  const previews = useRef([]);
  useEffect(() => {
    return () => {
      previews.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const room = photoFiles.room(items, max);

  // Before any photo is in, a video may be picked or dropped here too where
  // the post can take one: it is the composer's to take (`onVideo`), as a
  // post holds photos or a video, not both. A photo among what was dropped
  // decides it.
  const takesVideo = Boolean(onVideo) && videoMimetypes.length > 0 && items.length === 0;

  // Each picked file as it was picked, by its item's key, to send again
  // when its upload failed.
  const originals = useRef({});

  // A photo made ready (utils/preparePhoto: no larger than is kept, upright,
  // a JPEG or a PNG), then sent, saying how far it has got. Its preview is
  // the one made ready, which every browser can show, an iPhone's HEIC
  // included.
  const send = (key, file) => {
    onChange((current) => {
      return photoFiles.update(current, key, { status: STATUS.UPLOADING, progress: 0, error: '' });
    });
    preparePhoto(file).then((prepared) => {
      if (prepared !== file) {
        const previewUrl = URL.createObjectURL(prepared);
        previews.current.push(previewUrl);
        onChange((current) => {
          return photoFiles.update(current, key, { previewUrl });
        });
      }
      return api.photos.upload(owner, prepared, (progress) => {
        onChange((current) => {
          return photoFiles.update(current, key, { progress });
        });
      });
    }).then((result) => {
      delete originals.current[key];
      // A HEIC this browser could not read was sent as it is (roadmap row
      // 135): its preview is the size the server made of it.
      const urls = result.data.urls || {};
      const made = !canShow(file) && (urls.medium || urls.large || urls.original);
      onChange((current) => {
        return photoFiles.update(current, key, {
          status: STATUS.READY,
          uploadId: result.data.uploadId,
          ...(made && made.url ? { previewUrl: made.url } : {}),
        });
      });
    }).catch((error) => {
      onChange((current) => {
        return photoFiles.update(current, key, {
          status: STATUS.FAILED,
          error: failureText(error),
        });
      });
    });
  };

  const handleDrop = (dropped) => {
    const files = dropped.filter((file) => {
      return isPhoto(file, supportedMimetypes);
    });
    if (files.length === 0) {
      if (takesVideo && dropped.length > 0) {
        onVideo(dropped[0]);
      }
      return;
    }

    // No more than there is room for; the rest are left out, not queued.
    setLeftOut(Math.max(files.length - room, 0));

    // The files themselves, to whoever wants to read something of them in
    // this browser: the composer, for where a photo was taken (part 5).
    if (onPicked) {
      onPicked(files.slice(0, room));
    }

    files.slice(0, room).forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      previews.current.push(previewUrl);

      const item = photoFiles.picked(file, previewUrl);
      originals.current[item.key] = file;
      onChange((current) => {
        return [...current, item];
      });

      // Sent straight away, so by the time the post is written the images
      // are already stored.
      send(item.key, file);
    });
  };

  // Files picked outside, by the composer's own photo button, which opens
  // the system's picker in one tap: taken as if dropped here, then said to
  // be taken, so that the editor drawn again, when the composer is opened
  // again, does not take them a second time.
  useEffect(() => {
    if (incoming && incoming.files && incoming.files.length > 0) {
      handleDrop(incoming.files);
      if (onIncomingTaken) {
        onIncomingTaken();
      }
    }
  }, [incoming]);

  const { getRootProps, getInputProps } = useDropzone({
    // react-dropzone takes a map of MIME type to file extensions.
    accept: Object.fromEntries([
      ...supportedMimetypes,
      ...(takesVideo ? videoMimetypes : []),
    ].map((type) => {
      return [type, []];
    })),
    multiple: true,
    disabled: disabled || room === 0,
    onDrop: handleDrop,
  });

  return {
    room,
    takesVideo,
    leftOut,
    setLeftOut,
    getRootProps,
    getInputProps,
    // A photo can be sent again while this browser still holds its file.
    canRetry: (key) => {
      return Boolean(originals.current[key]);
    },
    retry: (key) => {
      send(key, originals.current[key]);
    },
  };
};

export { failureText, isPhoto };
export default usePhotoUploads;
