import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import actions from '../actions';

// Snackbar's transition needs a ref to the DOM node of its child.
const Alert = React.forwardRef((props, ref) => {
  return <MuiAlert elevation={6} variant="filled" ref={ref} {...props} />;
});

const Alerts = ({
  alerts = [],
  deleteItem,
}) => {
  const handleClose = (event, id) => {
    deleteItem(id);
  };

  const alert = alerts.pop();

  if (alert) {
    return (
      <Snackbar
        open
        autoHideDuration={6000}
        onClose={(e) => {
          return handleClose(e, alert.id);
        }}
      >
        <Alert
          onClose={(e) => {
            return handleClose(e, alert.id);
          }}
          severity={alert.severity}
        >
          {alert.body}
        </Alert>
      </Snackbar>
    );
  }

  return (<></>);
};

Alerts.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    body: PropTypes.string,
    severity: PropTypes.string,
  })),
  deleteItem: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const {
    alerts,
  } = state.app;

  return {
    alerts,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    deleteItem: (id) => {
      return dispatch(actions.app.deleteAlert(id));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Alerts);
