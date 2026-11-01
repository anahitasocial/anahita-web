/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// What a site chooses when the app is built, from `.env.local` or the
// environment, by the names docs/configuration.md gives them. They are read
// in the app as process.env.REACT_APP_… and in index.html as %REACT_APP_…%.
const PREFIXES = ['REACT_APP_', 'PUBLIC_URL'];

const escapeHtml = (value) => {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

// In index.html, a setting nobody gave is empty, not its own name.
const settingsInHtml = (env) => {
  return {
    name: 'settings-in-html',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => {
        return html.replace(/%(REACT_APP_[A-Z0-9_]+|PUBLIC_URL)%/g, (match, name) => {
          return escapeHtml(env[name] || '');
        });
      },
    },
  };
};

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), PREFIXES);
  const src = path.resolve(process.cwd(), 'src');

  return {
    plugins: [react(), settingsInHtml(env)],
    // The legal pages, read as files by src/statics/legal.
    assetsInclude: ['**/*.md'],
    envPrefix: PREFIXES,
    // Where a build is served from, when that is not the site's root.
    base: command === 'build' && env.PUBLIC_URL ? `${env.PUBLIC_URL.replace(/\/$/, '')}/` : '/',
    define: {
      'process.env': JSON.stringify(env),
    },
    resolve: {
      alias: {
        // The theme a site chose (docs/customising.md), and the store with
        // its logging only in development.
        'site-assets': path.join(src, 'assets', env.REACT_APP_ASSETS || 'default'),
        'site-store': path.join(src, 'store', mode === 'development' ? 'dev' : 'prod'),
      },
    },
    build: {
      // web-shell gives /static/ its long cache: its files are named by
      // what is in them.
      outDir: 'build',
      assetsDir: 'static',
      sourcemap: process.env.GENERATE_SOURCEMAP !== 'false',
      target: ['chrome117', 'edge121', 'firefox121', 'safari17'],
    },
    server: {
      port: 3000,
      strictPort: true,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/setupTests.js'],
      include: ['src/**/*.test.{js,jsx}'],
      css: false,
    },
  };
});
