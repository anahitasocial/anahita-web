/* eslint-disable no-undef */
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import actions from '../actions';
import passkeyOffer from '../utils/passkeyOffer';
import afterSignIn from '../utils/afterSignIn';

const OAuthCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const storedState = sessionStorage.getItem('oauth_state');

    if (error) {
      navigate('/');
      return;
    }

    if (!code || state !== storedState) {
      navigate('/');
      return;
    }

    dispatch(actions.session.handleCallback(code))
      .then(() => {
        // Signed in just now: a passkey may be offered (roadmap row 153).
        passkeyOffer.markDue();
        // On to where they were going, when they were (roadmap row 134).
        navigate(afterSignIn.take() || '/');
      })
      .catch(() => {
        navigate('/');
      });
  }, [dispatch, navigate, location.search]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <p>Signing in...</p>
    </div>
  );
};

export default OAuthCallback;
