import React from 'react';
import assets from '../../assets';

const { Home } = assets;

// The active theme's Home, given that theme's logo and its own home page in
// Markdown (`pages/home.md`), if it has one. The theme cannot import them
// itself: src/assets is the module that loads it.
const HomePage = (props) => {
  return (
    <Home
      themeLogo={assets.logo}
      homeMarkdown={(assets.pages || {}).home || null}
      {...props}
    />
  );
};

export default HomePage;
