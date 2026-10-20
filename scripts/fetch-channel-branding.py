#!/usr/bin/env python3
"""Fetch public YouTube channel artwork for Creator HQ. Never accesses private APIs."""
import json,re,urllib.request,urllib.parse,pathlib,sys,time
CHANNELS={
  "whatif": "https://www.youtube.com/@WhatIfin35seconds",
  "bizarre": "https://www.youtube.com/@BizarrePast69",
  "wild": "https://www.youtube.com/@LittleWildAdventures67",
}
DIR=pathlib.Path('assets'); DIR.mkdir(exist_ok=True)
HEADERS={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36','Accept-Language':'en-US,en;q=0.8'}
def get(url):
  req=urllib.request.Request(url,headers=HEADERS)
  with urllib.request.urlopen(req,timeout=30) as f: return f.read()
def decode(s):
  return json.loads('"'+s.replace('\\','\\\\').replace('"','\\"')+'"') if '\\u' in s else s.replace('\\u0026','&')
def url_for(html,kind):
  # Structured legacy YouTube channel metadata and image candidates
  patterns=([r'"avatar":\{"thumbnails":\[(.*?)\]',r'<meta property="og:image" content="([^"]+)"',r'"avatarViewModel".{0,500}?"url":"(https[^"]+)"'] if kind=='avatar' else [r'"banner":\{"thumbnails":\[(.*?)\]',r'"bannerViewModel".{0,1800}?"url":"(https[^"]+)"',r'"banner":\{.{0,1200}?"url":"(https[^"]+)"'])
  for p in patterns:
    m=re.search(p,html,re.S)
    if not m: continue
    text=m.group(1)
    urls=re.findall(r'"url":"(https[^"]+)"',text) or ([text] if text.startswith('https') else [])
    if urls:
      return max(urls,key=len).replace('\\u0026','&')
  return None
done=0
for key,page in CHANNELS.items():
  try:
    html=get(page).decode('utf8','ignore')
    for kind in ('avatar','banner'):
      source=url_for(html,kind)
      if not source:
        print(f'{key}: no public {kind} image metadata found');continue
      # Only download Google-owned YouTube image CDN resources
      host=urllib.parse.urlparse(source).hostname or ''
      if not (host.endswith('.googleusercontent.com') or host.endswith('.ggpht.com') or host=='yt3.ggpht.com'):
        print(f'{key}: untrusted image host {host}');continue
      image=get(source)
      if len(image)>7_000_000: raise ValueError('Image too large')
      # Base64/encoding not necessary; preserve original image format
      ext='.webp' if image[:4]==b'RIFF' else '.png' if image[:8]==b'\x89PNG\r\n\x1a\n' else '.jpg'
      dest=DIR/(key+'-'+kind+ext); dest.write_bytes(image);done+=1
      print(f'{key}: saved {dest}, {len(image)} bytes')
  except Exception as e:
    print(f'{key}: could not fetch assets: {type(e).__name__} {str(e)[:100]}')
print(f'Fetched {done} artwork files. If missing, design falls back gracefully.')
