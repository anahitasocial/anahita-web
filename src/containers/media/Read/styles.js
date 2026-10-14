export default (theme) => {
  return {
    cover: {
      height: 0,
      paddingTop: '30%',
    },
    portraitButton: {
      width: '100%',
      display: 'inline',
      cursor: 'zoom-in',
    },
    // The size of a profile's name, a step above a post's title in a list.
    title: {
      fontSize: 22,
      fontWeight: 600,
      lineHeight: 1.3,
      marginBottom: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        fontSize: 26,
      },
    },
    authorName: {
      fontSize: 16,
    },
    ownerName: {
      fontSize: 12,
    },
  };
};
