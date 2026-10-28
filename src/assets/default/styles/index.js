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
      // Anahita's colours, shared with www.anahita.io: ink, which matches
      // the black-and-white logo and turns near-white in dark mode, and
      // signal red, an accent used sparingly (red also means an error);
      // chosen on 2026-10-25, and again on 2026-10-26 after the others in the
      // colour picker were tried. A palette somebody chooses for themselves
      // goes over these (styles/index.js).
      primary: {
        main: prefersDarkMode ? '#E6E8EB' : '#1F2328',
      },
      secondary: {
        main: prefersDarkMode ? '#E57575' : '#D62828',
      },
      error: red,
    },
  };
};

export default {
  global,
};
