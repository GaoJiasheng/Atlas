"""Optional build-time reference cache; never invoked at runtime."""
import pathlib,json,subprocess
root=pathlib.Path(__file__).resolve().parent
refs=root/'refs';refs.mkdir(exist_ok=True)
for key,item in json.loads((root/'references.json').read_text()).items():
    target=refs/(key+'.jpg')
    if target.exists():continue
    url=item.get('image')
    if not url:continue
    result=subprocess.run(['curl','--fail','--location','--silent','--show-error','--retry','2',url,'--output',str(target)+'.part'])
    if result.returncode==0:pathlib.Path(str(target)+'.part').replace(target)
    else:print('Could not download reference:',item['url'])
