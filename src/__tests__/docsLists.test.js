/* eslint-env jest */
// No list in the docs has more than three bullets.
//
// A list of four items or more is numbered, so that one of them can be
// pointed to ("item 4"), as the app numbers its own lists (AGENTS.md,
// utils/lists.js). Three or fewer stay bullets. Reads AGENTS.md, README.md
// and every Markdown file under docs/, but not the finished plans in
// docs/plans/done/, which are a record. Code blocks are skipped.
// anahita-services checks its own docs the same way (`make docs_check`,
// scripts/check_docs_lists.py, which can also number them: `--fix`).

const fs = require('fs');
const path = require('path');

const DOCS = path.resolve(__dirname, '../../docs');

const BULLET = /^( *)[-*] (?=\S)/;
const FENCE = /^\s*(```|~~~)/;
const STARTS_SOMETHING = /^ *(#|\||>|\d+\. |[-*] )/;

const markdownFiles = (dir) => {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const at = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return at.endsWith(path.join('plans', 'done')) ? [] : markdownFiles(at);
    }
    return entry.name.endsWith('.md') ? [at] : [];
  });
};

const leading = (line) => { return line.length - line.trimStart().length; };

// The lines each bullet list of more than three items starts at.
const longLists = (text) => {
  const lines = text.split('\n');
  const found = [];
  // Each list once: its items, by the line its first is on.
  const counted = new Set();
  let fence = false;

  lines.forEach((line, i) => {
    if (FENCE.test(line)) {
      fence = !fence;
      return;
    }
    const m = !fence && BULLET.exec(line);
    if (!m || counted.has(i)) {
      return;
    }
    const indent = m[1].length;
    const items = [i];
    let inner = false;
    for (let j = i + 1; j < lines.length; j += 1) {
      const l = lines[j];
      if (FENCE.test(l)) {
        inner = !inner;
      } else if (!inner) {
        const b = BULLET.exec(l);
        if (l.trim() === '') {
          let k = j + 1;
          while (k < lines.length && lines[k].trim() === '') { k += 1; }
          const next = lines[k] || '';
          const nb = BULLET.exec(next);
          if (!((nb && nb[1].length === indent) || leading(next) > indent)) {
            break;
          }
        } else if (b && b[1].length === indent) {
          items.push(j);
        } else if (leading(l) < indent ||
          (leading(l) === indent && (STARTS_SOMETHING.test(l) || lines[j - 1].trim() === ''))) {
          break;
        }
      }
    }
    items.forEach((at) => { counted.add(at); });
    if (items.length > 3) {
      found.push(i + 1);
    }
  });
  return found;
};

describe('the docs', () => {
  it('number every list of more than three items', () => {
    const root = path.dirname(DOCS);
    const files = [
      path.join(root, 'AGENTS.md'),
      path.join(root, 'README.md'),
      ...markdownFiles(DOCS),
    ];
    const long = files.flatMap((file) => {
      return longLists(fs.readFileSync(file, 'utf8')).map((line) => {
        return `${path.relative(path.dirname(DOCS), file)}:${line}`;
      });
    });
    expect(long).toEqual([]);
  });

  it('can tell a long list from a short one', () => {
    expect(longLists('- a\n- b\n- c\n')).toEqual([]);
    expect(longLists('Text\n\n- a\n- b\n  more of b\n- c\n\n- d\n')).toEqual([3]);
    expect(longLists('1. a\n   - x\n   - y\n2. b\n')).toEqual([]);
    expect(longLists('```\n- a\n- b\n- c\n- d\n```\n')).toEqual([]);
  });
});
