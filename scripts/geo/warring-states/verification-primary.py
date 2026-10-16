"""Capture public-domain passages used in route and chronology review."""
import json,re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import requests
from bs4 import BeautifulSoup
HEAD={'User-Agent':'AtlasHistoricalVerification/1.0 (research; local static educational atlas)'}
WORKS={
 '史記/卷004':['東徙','雒邑'], '史記/卷005':['石門','修魚','丹陽','鄢','鄧'],
 '史記/卷006':['十八年','二十三年','二十五年','三十七年','沙丘'],
 '史記/卷032':['山戎','孤竹'], '史記/卷037':['野王','君角'],
 '史記/卷039':['出奔','衛','狄'], '史記/卷041':['會稽','反國','分散','無彊'],
 '史記/卷047':['衞','葉','蔡'], '史記/卷065':['桂陵','大梁','馬陵'],
 '史記/卷070':['蜀'], '史記/卷073':['鄢','野王','上黨','平與','蘄南'],
 '史記/卷077':['鄴'], '史記/卷080':['濟西','臨菑'],
 '史記/卷081':['閼與','宜安'], '春秋左氏傳/莊公':['山戎'],
 '春秋左氏傳/僖公':['五鹿','曹','宋','滑','北門'],
 '春秋左氏傳/定公':['淮','漢','清發','雍澨'],
 '春秋左氏傳/哀公':['邗','黃池','泗'], '華陽國志/卷三':['葭萌','石牛','成都']}
def fetch(kv):
 title,needles=kv;url='https://zh.wikisource.org/wiki/'+title
 r=requests.get(url,headers=HEAD,timeout=35);r.raise_for_status();s=BeautifulSoup(r.text,'html.parser');body=s
 paragraphs=[p.get_text(' ',strip=True) for p in body.select('.mw-parser-output p') if p.get_text(strip=True)]
 picked=[p for p in paragraphs if any(n in p for n in needles)]
 return {'title':title,'url':url,'retrieved':'2026-10-16','publicDomainPassages':picked}
if __name__=='__main__':
 with ThreadPoolExecutor(max_workers=4) as pool:out=list(pool.map(fetch,WORKS.items()))
 Path(__file__).with_name('verification-primary.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
 for x in out:
  print('\n'+x['title'])
  for p in x['publicDomainPassages']:print(p[:1300])
