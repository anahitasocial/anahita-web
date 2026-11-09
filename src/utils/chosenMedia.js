import audioFiles from './audio';
import videos from './videos';
import i18n from '../languages';

// What is wrong with a GIF, a video or a sound chosen for a post, in words,
// or '' when nothing is: the same in the composer, under each note of a
// thread (roadmap row 143) and in the reply form. `canAudio` is whether a
// sound may be posted where it is going.
const problemOf = (file, nodeInfo, canAudio = true) => {
  if (audioFiles.isAudioType(file)) {
    const problem = canAudio ? audioFiles.problem(file, nodeInfo) : 'notAudio';
    return problem ? i18n.t(`audio:problems.${problem}`, {
      size: videos.megabytes(audioFiles.maxBytes(nodeInfo)),
    }) : '';
  }
  const problem = videos.problem(file, nodeInfo);
  return problem ? i18n.t(`videos:problems.${problem}`, {
    size: videos.megabytes(videos.maxBytes(nodeInfo)),
    minutes: Math.floor(videos.maxSeconds(nodeInfo) / 60),
    animationSize: videos.megabytes(videos.animationMaxBytes(nodeInfo)),
    seconds: videos.animationMaxSeconds(nodeInfo),
  }) : '';
};

export default {
  problemOf,
};
