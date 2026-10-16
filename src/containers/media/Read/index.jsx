import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';

import PersonType from '../../../proptypes/Person';
import MediaType from '../../../proptypes/Media';
import MEDIUM_DEFAULT from '../../../proptypes/MediumDefault';

import ControlLike from '../../likes/controls/Like';
import ControlEditAccess from '../../controls/medium/Access';
import Progress from '../../../components/Progress';
import MediumStepper from '../Stepper';
import MediaReadView from './MediaRead';
import useLinkPreview from '../Composer/useLinkPreview';
import linkPreviews from '../../../utils/linkPreviews';

import actions from '../../../actions';
import utils from '../../../utils';
import i18n from '../../../languages';
import perms from '../../../permissions';

const MediaRead = ({
  namespace,
  readItem,
  editItem,
  alertError,
  alertSuccess,
  isFetching,
  viewer,
  isAuthenticated,
  success,
  error,
  media,
}) => {
  const { current: medium } = media;
  const { id } = useParams();

  const formFields = useMemo(() => {
    let names = ['name', 'body'];
    if (namespace === 'notes') {
      names = ['body'];
    }
    return utils.form.createFormFields(names);
  }, [namespace]);

  const [isEditing, setIsEditing] = useState(false);
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [fields, setFields] = useState(formFields);

  // Same lightbox the browse list opens. Here the slice holds only the medium
  // that was read, so it opens on a list of one and steps nowhere.
  const Stepper = useMemo(() => {
    return MediumStepper(namespace);
  }, [namespace]);

  // The form edits a draft, not the medium in the store. Binding the inputs
  // straight to the store's copy is what froze them: nothing wrote back to it
  // on change, so every keystroke was rendered away.
  const [current, setCurrent] = useState({ ...MEDIUM_DEFAULT });

  useEffect(() => {
    readItem(id, namespace);
  }, [readItem, id, namespace]);

  useEffect(() => {
    if (error) {
      alertError(i18n.t('prompts:updated.error'));
    }
    if (success) {
      alertSuccess(i18n.t('prompts:updated.success'));
    }
  }, [error, success]);

  const handleView = () => {
    setIsStepperOpen(true);
  };

  const handleCloseStepper = () => {
    setIsStepperOpen(false);
  };

  const handleEdit = () => {
    setCurrent({ ...medium });
    setFields(utils.form.dataToFields(medium, formFields));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setCurrent({ ...MEDIUM_DEFAULT });
    setFields(formFields);
    setIsEditing(false);
  };

  // Opened to be edited: "Edit" in a feed's menu leads here with ?edit=1.
  // The form goes up once the post has arrived, for somebody who may edit
  // it, and the mark is taken out of the address so that a reload, or
  // coming back, shows the post and not the form again.
  const [searchParams, setSearchParams] = useSearchParams();
  const wantsEdit = searchParams.get('edit') === '1';
  const loadedId = medium && medium.id;

  useEffect(() => {
    // The address holds the id with the post's slug after it.
    if (!wantsEdit || !loadedId || String(loadedId) !== String(id).split('-')[0]) {
      return;
    }
    if (perms.medium.canEdit(viewer, medium)) {
      handleEdit();
    }
    setSearchParams({}, { replace: true });
  }, [wantsEdit, loadedId, id]);

  const handleOnChange = (event) => {
    const { name, value } = event.target;
    const newFields = utils.form.validateField(event.target, fields);
    setCurrent((prev) => {
      return { ...prev, [name]: value };
    });
    setFields({ ...newFields, [name]: { ...newFields[name], value } });
  };

  // A note's card while it is edited: the one it has for as long as its
  // link is still the first in it, and the card of another link put in its
  // place. See the composer's useLinkPreview.
  const knownCard = useMemo(() => {
    return medium && medium.linkPreview ?
      { url: linkPreviews.urlToPreview(medium.body), preview: medium.linkPreview } :
      null;
  }, [medium && medium.id, medium && medium.linkPreview, medium && medium.body]);
  const linkPreview = useLinkPreview(
    isEditing ? current.body : '',
    isEditing && namespace === 'notes',
    knownCard,
  );

  const handleOnSubmit = (event) => {
    event.preventDefault();
    const { target } = event;
    const newFields = utils.form.validateForm(target, fields);

    if (utils.form.isValid(newFields)) {
      const formData = utils.form.fieldsToData(newFields);
      editItem({
        id: current.id,
        ...formData,
        // Which link the card is for, or that the card was taken off. What
        // the card says is the server's.
        ...(linkPreview.url ? { link_preview_url: linkPreview.url } : {}),
        ...(linkPreview.isRemoved ? { link_preview_remove: 1 } : {}),
      }).then(() => {
        linkPreview.reset();
        handleCancel();
      }).catch(() => {
        // The error alert already reports the failure; leave the form open so
        // the edit is not thrown away.
      });
    }

    setFields({ ...newFields });
  };

  if (!medium.id) {
    if (isFetching) {
      return <Progress />;
    }
    if (error !== '') {
      return <Navigate to="/404/" replace />;
    }
    return null;
  }

  const Like = ControlLike(namespace);
  const Access = ControlEditAccess(namespace);
  const canEdit = perms.medium.canEdit(viewer, medium);

  return (
    <>
      {isStepperOpen &&
        <Stepper
          mediumId={medium.id}
          open={isStepperOpen}
          handleClose={handleCloseStepper}
        />}
      <MediaReadView
        medium={medium}
        current={current}
        namespace={namespace}
        viewer={viewer}
        isAuthenticated={isAuthenticated}
        isEditing={isEditing}
        isFetching={isFetching}
        fields={fields}
        Like={Like}
        Access={Access}
        canEdit={canEdit}
        handleView={handleView}
        handleEdit={handleEdit}
        handleCancel={handleCancel}
        handleOnChange={handleOnChange}
        handleOnSubmit={handleOnSubmit}
        linkPreview={namespace === 'notes' ? linkPreview : null}
      />
    </>
  );
};

MediaRead.propTypes = {
  readItem: PropTypes.func.isRequired,
  editItem: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  media: MediaType.isRequired,
  namespace: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  success: PropTypes.bool.isRequired,
  viewer: PersonType.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = (namespace) => {
  return (state) => {
    const { isFetching, success, error } = state[namespace];
    const { viewer, isAuthenticated } = state.session;

    return {
      media: state[namespace][namespace],
      namespace,
      success,
      error,
      viewer,
      isAuthenticated,
      isFetching,
    };
  };
};

const mapDispatchToProps = (namespace) => {
  return (dispatch) => {
    return {
      readItem: (slug) => {
        const id = slug.split('-')[0];
        return dispatch(actions[namespace].read(id));
      },
      editItem: (node) => {
        return dispatch(actions[namespace].edit(node));
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
  )(MediaRead);
};
