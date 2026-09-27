const global = (params) => {
  const {
    colors: {
      red,
    },
    prefersDarkMode,
  } = params;

  return {
    typography: {
      fontFamily: '"Helvetica", "Arial", sans-serif',
      fontSize: 14,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
    },
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      primary: {
        main: prefersDarkMode ? '#90caf9' : '#098ED1',
      },
      error: red,
    },
  };
};

export default {
  global,
};
