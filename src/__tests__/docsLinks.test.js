/* eslint-env jest */
// Every link between the docs leads somewhere.
//
// Reads every Markdown file git keeps outside `src/` (the docs, the plans,
// README.md, AGENTS.md) and checks each relative link: that the file or
// folder it names exists, and that a `#heading` after it is a heading of that
// file, as GitHub makes them (lower case, punctuation dropped, spaces to
// hyphens, `-1`, `-2` for a repeat) or an `<a id>` in it.
//
// Links to the web (http, https, mailto) are not followed: that needs the
// network, and they are anahita-services' or the world's to keep. Code blocks
// and `inline code` are skipped, so an example is never taken for a link.
// The Markdown in `src/` is left out: the app shows it, and its links are the
// app's addresses (`/support`), not files. anahita-services checks its own
// docs the same way (`make docs_check`).

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

const FENCE = /^\s*(```|~~~)/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const ANCHOR = /<a\s+(?:id|name)="([^"]+)"/g;
const INLINE_CODE = /(`+)(.+?)\1/g;
// [text](target) and ![alt](target), with an optional "title" after the target.
const LINK = /!?\[(?:[^[\]]|\[[^\]]*\])*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
const EXTERNAL = /^[a-z][a-z0-9+.-]*:/i;

const markdownFiles = () => {
  const listed = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '*.md'],
    { cwd: ROOT, encoding: 'utf8' },
  ).split('\n').filter(Boolean);
  return [...new Set(listed)].sort()
    .filter((name) => { return !name.startsWith('src/'); })
    .map((name) => { return path.join(ROOT, name); })
    .filter((file) => { return fs.existsSync(file); });
};

// The file's lines with their numbers, leaving out fenced code blocks.
const linesOutsideCode = (file) => {
  const lines = [];
  let fenced = null;
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
    const fence = line.match(FENCE);
    if (fence) {
      if (fenced === null) {
        [, fenced] = fence;
      } else if (fence[1] === fenced) {
        fenced = null;
      }
      return;
    }
    if (fenced === null) {
      lines.push([index + 1, line]);
    }
  });
  return lines;
};

// A heading's anchor, the way GitHub makes it.
const slug = (heading) => {
  return heading
    .replace(INLINE_CODE, (match, ticks, code) => { return code; })
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // a link keeps its text
    .replace(/<[^>]+>/g, '') // and tags go
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\- ]/gu, '')
    .replace(/ /g, '-');
};

const anchorsOf = new Map();

const anchors = (file) => {
  if (!anchorsOf.has(file)) {
    const found = new Set();
    const seen = new Map();
    linesOutsideCode(file).forEach(([, line]) => {
      [...line.matchAll(ANCHOR)].forEach((match) => { found.add(match[1]); });
      const heading = line.match(HEADING);
      if (heading) {
        const base = slug(heading[2]);
        const count = seen.get(base) || 0;
        seen.set(base, count + 1);
        found.add(count === 0 ? base : `${base}-${count}`);
      }
    });
    anchorsOf.set(file, found);
  }
  return anchorsOf.get(file);
};

const brokenLinks = (file) => {
  const broken = [];
  linesOutsideCode(file).forEach(([number, line]) => {
    [...line.replace(INLINE_CODE, '').matchAll(LINK)].forEach(([, target]) => {
      if (EXTERNAL.test(target)) {
        return;
      }
      const [name, fragment] = target.split('#');
      const decoded = decodeURIComponent(name);
      let dest = file;
      if (decoded.startsWith('/')) {
        dest = path.join(ROOT, decoded);
      } else if (decoded) {
        dest = path.resolve(path.dirname(file), decoded);
      }
      const where = `${path.relative(ROOT, file)}:${number}: ${target}`;
      if (!fs.existsSync(dest)) {
        broken.push(`${where}: no such file`);
      } else if (
        fragment
        && dest.endsWith('.md')
        && !anchors(dest).has(decodeURIComponent(fragment).toLowerCase())
      ) {
        broken.push(`${where}: no such heading`);
      }
    });
  });
  return broken;
};

describe('the docs', () => {
  it('make headings into anchors as GitHub does', () => {
    expect(slug('Where it stands, and what is next (2026-10-17)'))
      .toBe('where-it-stands-and-what-is-next-2026-10-17');
    expect(slug('`REACT_APP_ASSETS` and themes')).toBe('react_app_assets-and-themes');
    expect(slug("Changing a post's images")).toBe('changing-a-posts-images');
    expect(slug('Café — résumé')).toBe('café--résumé');
  });

  it('link only to pages and headings there are', () => {
    const files = markdownFiles();
    expect(files.length).toBeGreaterThan(0);
    expect(files.flatMap(brokenLinks)).toEqual([]);
  });
});
