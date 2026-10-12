import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

import EventForm from './Form';
import api from '../../api';
import i18n from '../../languages';
import PageColumn from '../../components/PageColumn';

// Making an event. With ?host=<group id> in the address it is hosted by
// that group, which is how "Add event" on a group's page arrives here. The
// server checks that whoever is making it administers the group.
const EventAdd = () => {
  const [searchParams] = useSearchParams();
  const hostId = Number(searchParams.get('host')) || 0;
  const [host, setHost] = useState(null);

  useEffect(() => {
    if (!hostId) {
      setHost(null);
      return;
    }

    api.groups.read(hostId).then((result) => {
      setHost(result.data);
    }).catch(() => {
      setHost(null);
    });
  }, [hostId]);

  return (
    <>
      <Helmet>
        <title>{i18n.t('events:add.cTitle')}</title>
      </Helmet>
      <PageColumn>
        <EventForm
            // Made again when the host arrives, so its name is on the form.
          key={`event-add-${host ? host.id : 0}`}
          host={host}
        />
      </PageColumn>
    </>
  );
};

export default EventAdd;
