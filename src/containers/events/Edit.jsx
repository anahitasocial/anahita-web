import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useParams } from 'react-router-dom';

import Progress from '../../components/Progress';
import EventForm from './Form';
import api from '../../api';
import i18n from '../../languages';
import utils from '../../utils';
import PageColumn from '../../components/PageColumn';

// Changing an event: what it is called, when it is, how many may go.
//
// The event is read again here and not taken from the store, so the form
// starts from what is saved. Somebody who may not change it is sent to the
// event's page; the server would refuse them anyway.
const EventEdit = () => {
  const { id: slug } = useParams();
  const [id] = slug.split('-');
  const [actor, setActor] = useState(null);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    api.events.read(id).then((result) => {
      setActor(result.data);
    }).catch(() => {
      setHasFailed(true);
    });
  }, [id]);

  if (hasFailed) {
    return <Navigate to="/404/" replace />;
  }

  if (!actor) {
    return <Progress />;
  }

  if (!(actor.authorized && actor.authorized.edit)) {
    return <Navigate to={utils.node.getURL(actor)} replace />;
  }

  return (
    <>
      <Helmet>
        <title>{i18n.t('events:event.form.edit')}</title>
      </Helmet>
      <PageColumn>
        <EventForm actor={actor} />
      </PageColumn>
    </>
  );
};

export default EventEdit;
