const global = (params) => {
  const {
    colors: {
      red,
    },
    prefersDarkMode,
    palette,
  } = params;
  // A palette from the colour picker, on the dev server, in place of
  // Anahita's own.
  const chosen = palette && palette[prefersDarkMode ? 'dark' : 'light'];

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
      // signal red, an accent used sparingly (red also means an error).
      primary: {
        main: (chosen && chosen.primary) || (prefersDarkMode ? '#E6E8EB' : '#1F2328'),
      },
      secondary: {
        main: (chosen && chosen.secondary) || (prefersDarkMode ? '#E57575' : '#D62828'),
      },
      error: red,
    },
  };
};

export default {
  global,
};
