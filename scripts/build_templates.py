#!/usr/bin/env python3
"""Turn the three original prompt TXT files into a browser-readable JS asset.
Supports local file:// previews and GitHub Pages with no network API.
"""
from pathlib import Path
import json,re,sys
ROOT=Path(__file__).resolve().parent.parent
SOURCES={
  'college': ('college-v1.3.txt', '學院研究分析', 'College Research Intelligence', 'v1.3', '# GLOBAL VARIABLE RULES'),
  'department': ('department-v1.2.2.txt', '系所研究分析與自評', 'Department Research Intelligence', 'v1.2.2', '# PART I.'),
  'researcher': ('researcher-v1.0.txt', '研究者學術成果分析', 'Researcher Research Intelligence', 'v1.0', '# PART I.'),
}
meta={}
for slug,(file,zh,en,version,end_marker) in SOURCES.items():
 raw=(ROOT/'templates'/file).read_text(encoding='utf-8-sig')
 first=raw.find(end_marker)
 if first < 0: raise RuntimeError(f'No end marker: {slug}')
 section=raw[:first]
 vars={}
 for m in re.finditer(r'^\s*([A-Z][A-Z_0-9]+)\s*:\s*(.*?)\s*$',section,re.M):
  k,v=m.groups()
  # YAML-ish values: all three source templates use JSON strings, bools and ints
  if v.startswith('"'):
   val=json.loads(v)
  elif v in ('true','false'):
   val=v=='true'
  elif re.fullmatch(r'\d+',v):
   val=int(v)
  else:
   raise RuntimeError(f'Cannot parse {k}: {v}')
  if k in vars: raise RuntimeError(f'Duplicate key {k}')
  vars[k]=val
 meta[slug]={'file':file,'zh':zh,'en':en,'version':version,'raw':raw,'defaults':vars,'endMarker':end_marker}
 print(slug,len(vars),'variables,',len(raw),'characters')
output='// Auto-generated. Source: templates/*.txt — do not edit directly.\nwindow.RI_TEMPLATES = '+json.dumps(meta,ensure_ascii=False,separators=(',',':'))+';\n'
(ROOT/'assets'/'templates.js').write_text(output,encoding='utf-8')
