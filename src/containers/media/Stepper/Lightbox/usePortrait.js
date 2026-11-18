import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import utils from '../../../../utils';
import photoFiles from '../../../../utils/photoFiles';

const { getPortraitURL, getPortraitURLs } = utils.node;

// Below this a mouse gesture is a click that toggles zoom; above it, a pan.
const DRAG_THRESHOLD = 5;

// The picture on show in the lightbox: the fitted size found, the full
// upload fetched to zoom into, and a zoomed picture panned with the mouse.
// Given the post and which of its images is on show; it gives what the
// pane draws and the handlers it puts on the pane and the image.
//
// A post with several images is shown one image at a time. `shown` is the
// post as if the image on show were its only one, which is all the rest of
// this needs to know about there being several.
const usePortrait = ({ medium, fileIndex = 0 }) => {
  const [resolvedSrc, setResolvedSrc] = useState('');
  const [loadedSrc, setLoadedSrc] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isZoomLoading, setIsZoomLoading] = useState(false);
  const [hasZoomFailed, setHasZoomFailed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const paneRef = useRef(null);
  const dragRef = useRef(null);
  const zoomLoaderRef = useRef(null);

  const shown = useMemo(() => {
    return photoFiles.asSingle(medium, fileIndex);
  }, [medium, fileIndex]);

  // A size the API lists is not necessarily a size it stored, so these are
  // candidates rather than a URL.
  const portraits = useMemo(() => {
    return getPortraitURLs(shown, 'large');
  }, [shown]);

  // Probing candidates by pointing the visible <img> at them blanks the pane
  // once per 404, so a photo whose 'large' was never generated flickers twice
  // before it appears. Resolve out of band instead and hand the element only a
  // URL that has already loaded — it then paints from cache, in one step.
  useEffect(() => {
    let isCurrent = true;
    setResolvedSrc('');

    const attempt = (index) => {
      const candidate = portraits[index];
      if (!isCurrent || !candidate) return;

      const probe = new window.Image();
      probe.onload = () => {
        if (isCurrent) setResolvedSrc(candidate);
      };
      probe.onerror = () => {
        attempt(index + 1);
      };
      probe.src = candidate;
    };

    attempt(0);

    return () => {
      isCurrent = false;
    };
  }, [portraits]);

  // The full upload runs to several megabytes, so it is fetched only once
  // someone asks to zoom — never on open, and never by the neighbour prefetch.
  const zoom = getPortraitURL(shown, 'original');
  const hasPortrait = portraits.length > 0;
  const src = isZoomed ? zoom : resolvedSrc;
  // Derived rather than reset in an effect: an effect lands a frame late, and
  // that frame shows the previous photo under the new src.
  const isPortraitLoaded = Boolean(src) && loadedSrc === src;
  const canZoom = hasPortrait && Boolean(zoom) && !hasZoomFailed;

  // Drop a download still in flight: its photo is no longer the one on screen.
  const cancelZoomLoad = useCallback(() => {
    if (zoomLoaderRef.current) {
      zoomLoaderRef.current.onload = null;
      zoomLoaderRef.current.onerror = null;
      zoomLoaderRef.current = null;
    }
    setIsZoomLoading(false);
  }, []);

  useEffect(() => {
    setIsZoomed(false);
    setHasZoomFailed(false);
    cancelZoomLoad();
  }, [medium.id, fileIndex, cancelZoomLoad]);

  useEffect(() => {
    return cancelZoomLoad;
  }, [cancelZoomLoad]);

  // The original runs to several megabytes, so fetch it out of band and keep
  // the fitted image on screen until it has arrived — swapping src first would
  // blank the pane for the length of the download.
  const handleZoomToggle = useCallback(() => {
    if (isZoomed) {
      // The fitted size is still cached from before the zoom, so mark it
      // loaded as we go back to it rather than fading in from a spinner.
      setLoadedSrc(resolvedSrc);
      setIsZoomed(false);
      return;
    }
    if (!canZoom || isZoomLoading) return;

    const loader = new window.Image();
    zoomLoaderRef.current = loader;
    setIsZoomLoading(true);

    loader.onload = () => {
      if (zoomLoaderRef.current !== loader) return;
      zoomLoaderRef.current = null;
      setIsZoomLoading(false);
      // Marked loaded before it is shown: it is in cache, so the swap must not
      // fade out through a blank frame on the way in.
      setLoadedSrc(zoom);
      setIsZoomed(true);
    };

    loader.onerror = () => {
      if (zoomLoaderRef.current !== loader) return;
      zoomLoaderRef.current = null;
      setIsZoomLoading(false);
      setHasZoomFailed(true);
    };

    loader.src = zoom;
  }, [canZoom, isZoomed, isZoomLoading, zoom, resolvedSrc]);

  // Panning is mouse-only: a zoomed pane scrolls, so touch already pans itself.
  const handleMouseDown = (event) => {
    if (!isZoomed || !paneRef.current) return;
    event.preventDefault();
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: paneRef.current.scrollLeft,
      scrollTop: paneRef.current.scrollTop,
      moved: false,
    };
    setIsPanning(true);
  };

  const handleMouseMove = (event) => {
    const drag = dragRef.current;
    if (!drag || !paneRef.current) return;

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      drag.moved = true;
    }

    paneRef.current.scrollLeft = drag.scrollLeft - dx;
    paneRef.current.scrollTop = drag.scrollTop - dy;
  };

  const handleMouseUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    setIsPanning(false);
    // A press that went nowhere was a click, so it zooms back out.
    if (drag && !drag.moved) handleZoomToggle();
  };

  const handleImageLoad = () => {
    setLoadedSrc(src);
    // Open the zoom on the middle of the photo rather than its top-left
    // corner.
    const pane = paneRef.current;
    if (isZoomed && pane) {
      pane.scrollLeft = (pane.scrollWidth - pane.clientWidth) / 2;
      pane.scrollTop = (pane.scrollHeight - pane.clientHeight) / 2;
    }
  };

  const handleImageError = () => {
    // Everything shown here was fetched successfully moments ago, so this
    // only fires if the cache dropped it. Fall back to the fitted view;
    // the resolver picks a size again on the next photo.
    if (isZoomed) setIsZoomed(false);
  };

  return {
    hasPortrait,
    src,
    isPortraitLoaded,
    canZoom,
    isZoomed,
    isZoomLoading,
    isPanning,
    paneRef,
    handleZoomToggle,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleImageLoad,
    handleImageError,
  };
};

export default usePortrait;
