import axios from 'axios';

// The card for a link, from the installation's link preview service.
//
// The service is optional and a page may have nothing to show: either way
// there is no card, and whoever asked draws none.

// Answers with the preview, or with nothing (204) when there is none.
const read = (url) => {
  return axios.get('/link-previews', { params: { url } });
};

export default {
  read,
};
