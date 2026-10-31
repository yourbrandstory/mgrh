"""Usage: python .design/cmp.py <design.json> <live.json> [--all]"""
import json, sys, difflib

a = json.load(open(sys.argv[1]))
b = json.load(open(sys.argv[2]))
show_all = '--all' in sys.argv

def key(x):
    return x['own']

ta = [key(x) for x in a]
tb = [key(x) for x in b]

sm = difflib.SequenceMatcher(a=ta, b=tb, autojunk=False)
matched_a, matched_b = set(), set()
missing, extra, stylediff = [], [], []

for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == 'equal':
        for k in range(i2 - i1):
            ia, ib = i1 + k, j1 + k
            matched_a.add(ia); matched_b.add(ib)
            da, db = a[ia], b[ib]
            diffs = []
            fields = ['fontSize', 'fontWeight', 'color', 'letterSpacing', 'lineHeight', 'textTransform']
            if '--w' in sys.argv:
                fields.append('w')
            for f in fields:
                if str(da.get(f)) != str(db.get(f)):
                    diffs.append(f"{f}: {da.get(f)} -> {db.get(f)}")
            if diffs:
                stylediff.append((da['tag'], da['own'][:70], diffs))
    elif tag in ('delete', 'replace'):
        for i in range(i1, i2):
            missing.append(a[i])
    if tag in ('insert', 'replace'):
        for j in range(j1, j2):
            extra.append(b[j])

print(f'design entries={len(a)}  live entries={len(b)}  matched={len(matched_a)}')
print(f'\n--- MISSING on live (in design, not on page): {len(missing)}')
for m in missing:
    print(f"  [{m['tag']}] {m['own'][:100]!r}  {m['fontSize']} {m['fontWeight']} {m['color']}")

print(f'\n--- EXTRA on live (not in design): {len(extra)}')
for e in extra:
    print(f"  [{e['tag']}] {e['own'][:100]!r}  {e['fontSize']} {e['fontWeight']} {e['color']}")

print(f'\n--- STYLE DIFFERENCES on matched text: {len(stylediff)}')
for tag, text, diffs in stylediff:
    print(f"  [{tag}] {text!r}")
    for d in diffs:
        print(f"       {d}")
