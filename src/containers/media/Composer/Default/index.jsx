import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import actions from '../../../../actions';
import utils from '../../../../utils';
import audience from '../../../../utils/audience';
import postLanguage from '../../../../utils/postLanguage';
import photoFiles from '../../../../utils/photoFiles';
import replyAccess from '../../../../utils/replyAccess';
import LanguageButton from '../../../../components/LanguageButton';
import ReplyAccessButton from '../../../../components/ReplyAccessButton';
import ComposerAudience from '../Audience';

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
}) => {
  const [fields, setFields] = useState(formFields);
  const [medium, setMedium] = useState({ ...MediumDefault });
  const [file, setFile] = useState(null);

  // The images of a photo post: picked, uploaded one by one as they are
  // picked, and put in order here before the post is made from them.
  const [photoItems, setPhotoItems] = useState([]);
  const isPhotos = namespace === 'photos';

  // Who can see the post. Starts on the last choice for this kind of
  // place, or the widest this profile allows; see utils/audience.
  const [access, setAccess] = useState(() => {
    return audience.defaultFor(actor, viewer);
  });

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
        composed: 1,
      }, actor).then(() => {
        postLanguage.remember(viewer, language);
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
        setPhotoItems([]);
        setFields({ ...formFields });
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
      namespace={namespace}
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
            disabled={isFetching}
          />
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
