#!/usr/bin/env python3
"""Inline the prototype into one self-contained HTML file.

    python3 build-single-file.py          # writes BusNetwork-Demo.html

The multi-file version stays the editable source; the single file is the one to
hand to other people, because it opens straight from the file system.
"""
import pathlib, re, datetime

here = pathlib.Path(__file__).parent
html = (here / 'index.html').read_text()

css = (here / 'styles.css').read_text()
html = html.replace('<link rel="stylesheet" href="styles.css">',
                    '<style>\n' + css + '\n</style>', 1)

def inline(match):
    name = match.group(1)
    code = (here / name).read_text()
    if '</script' in code:
        raise SystemExit('%s contains a literal </script> and cannot be inlined as-is' % name)
    return '<script>\n/* ===== ' + name + ' ===== */\n' + code + '\n</script>'

html, n = re.subn(r'<script src="([^"]+)"></script>', inline, html)
banner = ('<!--\n  BusNetwork portal \u2014 interactive demo (single file, no backend).\n'
          '  Generated %s from the prototype sources in this folder.\n'
          '  Open it by double-clicking; everything it needs is inside this file.\n-->\n'
          % datetime.date.today().isoformat())
out = here / 'BusNetwork-Demo.html'
out.write_text(banner + html)
print('wrote %s (%.0f KB, %d scripts inlined)' % (out.name, out.stat().st_size / 1024, n))
