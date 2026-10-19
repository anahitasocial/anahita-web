import _ from 'lodash';

const constructURLSearchParams = (urlParams) => {
  const params = new URLSearchParams();
  const keys = Object.keys(urlParams);

  keys.map((key) => {
    return params.append(key, urlParams[key]);
  });

  return params;
};

const constructFormData = (params) => {
  const formData = new FormData();
  const keys = Object.keys(params);

  // A list goes as the same key once for each item, as a form sends one
  // (`location_ids=12&location_ids=31`), which the services read as a list;
  // appended whole it would be one "12,31".
  keys.map((key) => {
    if (Array.isArray(params[key])) {
      return params[key].forEach((each) => {
        formData.append(key, each);
      });
    }
    return formData.append(key, params[key]);
  });

  return formData;
};

const camelCaseKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => {
      return camelCaseKeys(v);
    });
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = _.camelCase(key);
      return {
        ...result,
        [camelKey]: camelCaseKeys(obj[key]),
      };
    }, {});
  }
  return obj;
};

const snakeCaseKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => {
      return snakeCaseKeys(v);
    });
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = _.snakeCase(key);
      return {
        ...result,
        [snakeKey]: snakeCaseKeys(obj[key]),
      };
    }, {});
  }
  return obj;
};

export default {
  constructURLSearchParams,
  constructFormData,
  camelCaseKeys,
  snakeCaseKeys,
};
