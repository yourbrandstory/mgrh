"""Convert the rendered main content of a .dc.html design into JSX.

Usage: python .design/design2jsx.py <rendered.html> > out.jsx
"""
import sys, re, html as htmllib
from html.parser import HTMLParser

VOID = {'br', 'img', 'input', 'hr', 'meta', 'link', 'source', 'path', 'circle', 'rect',
        'line', 'polygon', 'polyline', 'ellipse', 'use', 'stop', 'area', 'col', 'embed', 'track', 'wbr'}

SVG_ATTR = {
    'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin',
    'stroke-dasharray': 'strokeDasharray', 'stroke-dashoffset': 'strokeDashoffset', 'stroke-opacity': 'strokeOpacity',
    'fill-rule': 'fillRule', 'clip-rule': 'clipRule', 'clip-path': 'clipPath', 'font-size': 'fontSize',
    'font-weight': 'fontWeight', 'text-anchor': 'textAnchor', 'dominant-baseline': 'dominantBaseline',
    'preserveAspectRatio': 'preserveAspectRatio', 'vector-effect': 'vectorEffect', 'stroke-miterlimit': 'strokeMiterlimit',
}

SKIP_ATTRS = {'data-dc-tpl', 'style-hover', 'style-focus', 'hint-placeholder-val', 'hint-placeholder-count',
              'class', 'xmlns:xlink', 'data-dc-script', 'data-props'}

ATTR_MAP = {
    'tabindex': 'tabIndex', 'readonly': 'readOnly', 'maxlength': 'maxLength', 'minlength': 'minLength',
    'autocomplete': 'autoComplete', 'autofocus': 'autoFocus', 'srcset': 'srcSet', 'crossorigin': 'crossOrigin',
    'referrerpolicy': 'referrerPolicy', 'colspan': 'colSpan', 'rowspan': 'rowSpan', 'cellpadding': 'cellPadding',
    'cellspacing': 'cellSpacing', 'charset': 'charSet', 'class': 'className', 'for': 'htmlFor',
    'allowfullscreen': 'allowFullScreen', 'frameborder': 'frameBorder', 'scrolling': 'scrolling',
    'autoplay': 'autoPlay', 'playsinline': 'playsInline', 'novalidate': 'noValidate', 'tabindex-': 'tabIndex',
}

HREF_MAP = {
    'index.html': '/', '#top': '/',
    'About us page V2.dc.html': '/about', 'About us page updated version.dc.html': '/about', 'about.html': '/about',
    'Facilities (V1).dc.html': '/facilities', 'Facilities (V1) update version.dc.html': '/facilities', 'facilities.html': '/facilities',
    'Doctors page.dc.html': '/doctors', 'Doctors page updated version.dc.html': '/doctors', 'doctors.html': '/doctors',
    'Programmes page.dc.html': '/programmes', 'Programmes page updated version.dc.html': '/programmes', 'programmes.html': '/programmes',
    'Event page.dc.html': '/events', 'Event page updated version.dc.html': '/events', 'events.html': '/events',
    'Support us page.dc.html': '/support', 'Support us page updated version.dc.html': '/support', 'support-us.html': '/support',
    'Contact us page.dc.html': '/contact', 'Contact us page updated version.dc.html': '/contact', 'contact.html': '/contact',
    'Emergency page.dc.html': '/emergency', 'Emergency page updated version.dc.html': '/emergency', 'emergency.html': '/emergency',
}


def camel(k):
    parts = k.split('-')
    return parts[0] + ''.join(p[:1].upper() + p[1:] for p in parts[1:])


def js_str(v):
    return "'" + v.replace('\\', '\\\\').replace("'", "\\'") + "'"


def style_to_jsx(style):
    decls = []
    for chunk in style.split(';'):
        if ':' not in chunk:
            continue
        k, v = chunk.split(':', 1)
        k, v = k.strip(), v.strip()
        if not k or not v:
            continue
        decls.append(f'{camel(k)}: {js_str(v)}')
    if not decls:
        return None
    return '{ ' + ', '.join(decls) + ' }'


class Conv(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.depth = 0
        self.skip = 0
        self.css = []

    def handle_starttag_style(self):
        pass

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('style', 'script'):
            self.skip += 1
            self.skip_tag = tag
            if tag == 'style':
                self._css = []
            return
        if tag == 'image-slot':
            label = a.get('placeholder', '')
            self.out.append(
                '<div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-[#C9DCD7] text-center text-[13px] text-muted">'
                f'<span className="px-3">{htmllib.escape(label)}</span></div>'
            )
            return
        props = []
        for k, v in attrs:
            if k in SKIP_ATTRS or k.startswith('on') or k.startswith('style-'):
                continue
            v = v or ''
            if k in ATTR_MAP:
                k = ATTR_MAP[k]
            if k == 'style':
                js = style_to_jsx(v)
                if js:
                    props.append(f'style={{{js}}}')
                continue
            elif k == 'href':
                v = HREF_MAP.get(v, v)
            elif k in SVG_ATTR:
                k = SVG_ATTR[k]
            if k == 'src':
                v = v.replace('assets/', '/images/')
            if k == 'srcSet':
                continue
            props.append(f'{k}={{{js_str(v)}}}' if k not in ('className',) else f'{k}="{v}"')
        p = (' ' + ' '.join(props)) if props else ''
        if tag in VOID:
            self.out.append(f'<{tag}{p} />')
        else:
            self.out.append(f'<{tag}{p}>')
            self.depth += 1

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.depth -= 1
            self.out.append(f'</{tag}>')

    def handle_endtag(self, tag):
        if tag in ('style', 'script'):
            if tag == 'style' and hasattr(self, '_css'):
                self.css.append(''.join(self._css))
            self.skip = max(0, self.skip - 1)
            return
        if tag == 'image-slot':
            return
        if tag in VOID:
            return
        self.depth -= 1
        self.out.append(f'</{tag}>')

    def handle_data(self, data):
        if self.skip:
            if getattr(self, 'skip_tag', None) == 'style':
                self._css.append(data)
            return
        if not data:
            return
        t = data
        if t.strip() == '':
            if '\n' in t:
                return
            t = t.replace('{', '&#12;').replace('}', '&#13;')
        else:
            t = t.replace('{', '&#12;').replace('}', '&#13;')
            t = t.replace('<', '&lt;').replace('>', '&gt;')
        self.out.append(t)


def extract_main(src):
    """Return the HTML of the page's main content (between header and footer)."""
    body = src[src.find('<body'):]
    m = re.search(r'<div class="sc-host"[^>]*>', body)
    start = m.end()
    # take everything until </footer>
    end = body.find('</footer>')
    seg = body[start:end]
    # drop the top band + header: remove up to </header>
    h_end = seg.find('</header>')
    if h_end > 0:
        seg = seg[h_end + len('</header>'):]
    f_start = seg.find('<footer')
    if f_start > 0:
        seg = seg[:f_start]
    return seg


def main():
    src = open(sys.argv[1], encoding='utf-8', errors='ignore').read()
    seg = extract_main(src)
    c = Conv()
    c.feed(seg)
    jsx = ''.join(c.out)
    jsx = re.sub(r'\s+', ' ', jsx)
    print(jsx)


if __name__ == '__main__':
    main()
