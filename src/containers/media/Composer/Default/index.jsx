import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import actions from '../../../../actions';
import utils from '../../../../utils';
import audience from '../../../../utils/audience';
import postLanguage from '../../../../utils/postLanguage';
import photoFiles from '../../../../utils/photoFiles';
import replyAccess from '../../../../utils/replyAccess';
import DownloadOptionButton from '../../../../components/DownloadOptionButton';
import LanguageButton from '../../../../components/LanguageButton';
import ReplyAccessButton from '../../../../components/ReplyAccessButton';
import ComposerAudience from '../Audience';
import useOnFediverse from '../useOnFediverse';
import useLinkPreview from '../useLinkPreview';

import AcctorType from '../../../../proptypes/Actor';
import PersonType from '../../../../proptypes/Person';
import MediumDefault from '../../../../proptypes/MediumDefault';
import i18n from '../../../../languages';

const MediaComposerDefault = ({
  actor,
  viewer,
  addItem,
  success,
  error,
  isFetching,
  alertError,
  alertSuccess,
  formComponent: FormComponent,
  formFields,
  supportedMimetypes = [],
  namespace,
  maxFiles = photoFiles.DEFAULT_MAX,
  initialBody = '',
  onPosted = null,
  bodyRows = 12,
}) => {
  const [fields, setFields] = useState(formFields);
  const [medium, setMedium] = useState({ ...MediumDefault, body: initialBody });
  const [file, setFile] = useState(null);

  // The images of a photo post: picked, uploaded one by one as they are
  // picked, and put in order here before the post is made from them.
  const [photoItems, setPhotoItems] = useState([]);
  const isPhotos = namespace === 'photos';

  // The card for the first link in a note, shown while it is written and
  // posted with it unless the writer takes it off.
  const linkPreview = useLinkPreview(medium.body, namespace === 'notes');

  // Who can see the post. Starts on the last choice for this kind of
  // place, or the widest this profile allows; see utils/audience.
  const [access, setAccess] = useState(() => {
    return audience.defaultFor(actor, viewer);
  });

  // A note on the writer's own profile, open to everybody, is sent to
  // their followers on other servers when they are on the fediverse. One
  // kept to fewer people is not, and the writer is told so before they
  // post, not left to wonder why it never arrived.
  const onFediverse = useOnFediverse(viewer);
  const staysHere = onFediverse &&
    namespace === 'notes' &&
    actor.id === viewer.id &&
    access !== 'public';

  // The same composer is reused when moving from one profile to another,
  // and what could be chosen on the last one may not be choosable here.
  useEffect(() => {
    setAccess(audience.defaultFor(actor, viewer));
  }, [actor.id, actor.access, viewer.id]);

  // The language it is written in. Starts on the one this person last
  // posted in, or their profile's, or the browser's; see
  // utils/postLanguage.
  const [language, setLanguage] = useState(() => {
    return postLanguage.defaultFor(viewer);
  });

  useEffect(() => {
    setLanguage(postLanguage.defaultFor(viewer));
  }, [viewer.id, viewer.language]);

  // Who can reply. Anyone unless the author says otherwise, and said for
  // each post: it is not remembered from the last one, because a post
  // closed to replies by habit is a surprise.
  const [whoReplies, setWhoReplies] = useState(replyAccess.ANYONE);

  // Whether a photo may be downloaded by whoever can see it. Starts on
  // what the profile it is posted on says, which is no unless that was
  // changed.
  const [allowDownload, setAllowDownload] = useState(Boolean(actor.allowDownload));

  useEffect(() => {
    setAllowDownload(Boolean(actor.allowDownload));
  }, [actor.id, actor.allowDownload]);

  // Who can quote. Not said unless the author chooses, which leaves the
  // post on their own setting.
  const [whoQuotes, setWhoQuotes] = useState('');

  useEffect(() => {
    if (error) {
      alertError(i18n.t('prompts:posted.error'));
    }

    if (success) {
      alertSuccess(i18n.t('prompts:posted.success'));
    }
  }, [error, success]);

  const handleOnChange = (event) => {
    const { target } = event;
    const { name, value } = target;
    const { form } = utils;

    medium[name] = value;

    const newFields = form.validateField(target, fields);

    setMedium({ ...medium });
    setFields({ ...newFields });
  };

  const handleOnFileSelect = (newFile) => {
    setFile(newFile);
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();

    const { form } = utils;
    const { target } = event;
    const newFields = form.validateForm(target, fields);

    setFields({ ...newFields });

    if (form.isValid(newFields)) {
      // The form's own button waits for this too; a post sent some other
      // way, by the Enter key in the title, stops here.
      if (isPhotos && !photoFiles.canSubmit(photoItems)) {
        alertError(i18n.t(photoFiles.isUploading(photoItems) ?
          'photos:editor.stillUploading' :
          'photos:editor.needOne'));
        return;
      }

      const formData = isPhotos ? {
        ...form.fieldsToData(newFields),
        uploads: photoFiles.toRequest(photoItems),
        allow_download: allowDownload,
      } : {
        ...form.fieldsToData(newFields),
        file,
      };

      addItem({
        ...formData,
        // Sent with the post, so it is never public first and narrowed
        // afterwards.
        access,
        language,
        ...replyAccess.toRequest(whoReplies),
        ...(whoQuotes ? { quote_policy: whoQuotes } : {}),
        // Which link the card is for. What the card says is the server's.
        ...(linkPreview.url ? { link_preview_url: linkPreview.url } : {}),
      }, actor).then(() => {
        // Remembered once it has been used, not when it is picked: a
        // choice somebody backed out of is not a habit.
        audience.remember(actor, viewer, access);
        setMedium({
          ...medium,
          name: '',
          body: '',
        });
        setFile(null);
        setWhoReplies(replyAccess.ANYONE);
        setWhoQuotes('');
        setPhotoItems([]);
        linkPreview.reset();
        setFields({ ...formFields });
        if (onPosted) {
          onPosted();
        }
      });
    }
  };

  return (
    <FormComponent
      actor={actor}
      viewer={viewer}
      medium={medium}
      fields={fields}
      handleOnChange={handleOnChange}
      handleOnFileSelect={handleOnFileSelect}
      handleOnSubmit={handleOnSubmit}
      isFetching={isFetching}
      supportedMimetypes={supportedMimetypes}
      success={success}
      file={file}
      photoItems={photoItems}
      onPhotoItemsChange={setPhotoItems}
      maxFiles={maxFiles}
      bodyRows={bodyRows}
      namespace={namespace}
      linkPreview={linkPreview.preview}
      direction={postLanguage.directionOf(language)}
      postHint={staysHere ? i18n.t('federation:composer.staysHere') : ''}
      onLinkPreviewRemove={linkPreview.remove}
      onBodyPaste={linkPreview.onPaste}
      // The choices that go with a post: who can see it, what language
      // it is in, and who can reply. Built here and handed over ready, so each form
      // only has to place them beside its button.
      postOptions={
        <>
          <ComposerAudience
            actor={actor}
            viewer={viewer}
            value={access}
            onChange={setAccess}
            disabled={isFetching}
          />
          <LanguageButton
            value={language}
            onChange={setLanguage}
            disabled={isFetching}
          />
          <ReplyAccessButton
            value={whoReplies}
            onChange={setWhoReplies}
            quotePolicy={whoQuotes}
            defaultQuotePolicy={viewer.quotePolicy}
            onQuotePolicyChange={setWhoQuotes}
            disabled={isFetching}
          />
          {isPhotos &&
            <DownloadOptionButton
              value={allowDownload}
              onChange={setAllowDownload}
              disabled={isFetching}
            />}
        </>
      }
    />
  );
};

MediaComposerDefault.propTypes = {
  addItem: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  actor: AcctorType.isRequired,
  viewer: PersonType.isRequired,
  formComponent: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]).isRequired,
  formFields: PropTypes.objectOf(PropTypes.any).isRequired,
  supportedMimetypes: PropTypes.arrayOf(PropTypes.string),
  success: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  namespace: PropTypes.string.isRequired,
  // How many images a photo post can hold, as the server says.
  maxFiles: PropTypes.number,
  // What was written in the short box before it was expanded to this.
  initialBody: PropTypes.string,
  // Told once the post is made: the extended composer closes.
  onPosted: PropTypes.func,
  // How many lines the text starts with.
  bodyRows: PropTypes.number,
};

const mapStateToProps = (namespace) => {
  return (state) => {
    const {
      success,
      error,
      isFetching,
    } = state[namespace];

    const { viewer } = state.session;

    return {
      maxFiles: photoFiles.maxFiles(state.app.nodeInfo),
      viewer,
      error,
      success,
      isFetching,
      namespace,
    };
  };
};

const mapDispatchToProps = (namespace) => {
  return (dispatch) => {
    return {
      addItem: (medium, owner) => {
        return dispatch(actions[namespace].add(medium, owner));
      },
      alertSuccess: (message) => {
        return dispatch(actions.app.alert.success(message));
      },
      alertError: (message) => {
        return dispatch(actions.app.alert.error(message));
      },
    };
  };
};

export default (namespace) => {
  return connect(
    mapStateToProps(namespace),
    mapDispatchToProps(namespace),
  )(MediaComposerDefault);
};
