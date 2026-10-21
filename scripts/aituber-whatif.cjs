// Produces only NEW What If Shorts; never modifies existing AITuber autopilot content.
const fs=require('node:fs');
const cp=require('node:child_process');
const base='https://app.aituber.app/api/v1';
const statePath='data/whatif-production-state.json';
const mode=process.argv[2] || 'check';
const token=process.env.AITUBER_API_KEY;
const enabled=process.env.AITUBER_PRODUCTION_ENABLED==='true';
const autopublish=process.env.AITUBER_AUTOPUBLISH_ENABLED==='true' && process.env.AITUBER_REVIEW_APPROVED==='true';
const minCredits=300;
const firstDay='2026-11-09';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const error=s=>{throw new Error(s)};
function payloadItems(o,fields){if(Array.isArray(o))return o;for(const v of [o,o?.data,o?.result])for(const k of fields)if(Array.isArray(v?.[k]))return v[k];return null}
async function api(path,method='GET',body){
 const response=await fetch(base+path,{method,headers:{Authorization:'Bearer '+token,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});
 if(!response.ok)error('AITuber '+path+' returned HTTP '+response.status);
 const raw=await response.text();return raw?JSON.parse(raw):{};
}
function oslo(){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit',weekday:'long'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
 return {date:p.year+'-'+p.month+'-'+p.day,weekday:p.weekday,year:+p.year,month:+p.month,day:+p.day};
}
function osloAt16(day){
 const target=Date.UTC(day.year,day.month-1,day.day,16),f=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Oslo',hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
 let guess=target;
 for(let i=0;i<3;i++){const p=Object.fromEntries(f.formatToParts(new Date(guess)).map(x=>[x.type,x.value]));guess+=target-Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute)}
 return new Date(guess);
}
function balance(o){
 const c=[o?.creditsRemaining,o?.remainingCredits,o?.creditBalance,o?.credits?.remaining,o?.credits?.balance,o?.credits?.available,o?.data?.creditsRemaining,o?.data?.remainingCredits,o?.data?.creditBalance,o?.data?.credits?.remaining,o?.data?.credits?.balance,o?.data?.credits,o?.credits];
 return c.find(v=>typeof v==='number'&&Number.isFinite(v))??null;
}
function channel(list){
 const found=list.filter(c=>{
  if(String(c.platform??c.platformType??'').toLowerCase()!=='youtube')return false;
  if(!['connected','active'].includes(String(c.status??c.connectionStatus??'connected').toLowerCase()))return false;
  return [c.name,c.displayName,c.channelName,c.title,c.username,c.handle].filter(Boolean).some(n=>['what if in 40 seconds','what if in 35 seconds','whatifin35seconds','whatifin40seconds'].includes(String(n).trim().toLowerCase().replace(/^@/,'')));
 });
 if(found.length!==1)error('Cannot unambiguously identify What If YouTube channel; refusing to act');
 const id=found[0].id??found[0].channelId;
 if(!id||typeof id!=='string')error('Channel ID missing');
 return id;
}
function save(state,msg){
 fs.writeFileSync(statePath,JSON.stringify(state,null,2)+'\n');
 if(process.env.GITHUB_ACTIONS!=='true')return;
 const git=(args)=>cp.execFileSync('git',args,{stdio:'pipe',timeout:30000});
 git(['config','user.name','github-actions[bot]']);git(['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
 git(['add',statePath]);
 try{git(['diff','--cached','--quiet']);return;}catch{}
 git(['commit','-m',msg]);git(['push','origin','HEAD:main']);
}
function idFrom(o){return o?.videoId??o?.id??o?.video?.id??o?.data?.videoId??o?.data?.id}
function publicationId(o){return o?.publicationId??o?.id??o?.data?.publicationId??o?.data?.id??o?.publications?.[0]?.id??o?.data?.publications?.[0]?.id}
async function main(){
 if(!token)error('AITUBER_API_KEY GitHub secret is missing');
 if(!['check','produce'].includes(mode))error('Unknown mode');
 const channels=payloadItems(await api('/channels?platform=youtube'),['channels','items']);
 if(!channels)error('Unknown channel response format');
 const youtubeId=channel(channels);
 const credits=balance(await api('/subscription'));
 console.log('What If YouTube connection verified; credit balance format: '+(credits===null?'unknown':'recognized'));
 if(mode==='check'){console.log('Read-only check successful. No credits spent.');return}
 if(!enabled){console.log('Production disabled by repository variable.');return}
 const day=oslo();
 if(day.date<firstDay||!['Monday','Wednesday'].includes(day.weekday)){console.log('No production slot today.');return}
 if(credits===null||credits<minCredits)error('Insufficient or unrecognized credit balance; refusing paid operation');
 const queue=JSON.parse(fs.readFileSync('data/whatif-production-queue.json','utf8'));
 const state=JSON.parse(fs.readFileSync(statePath,'utf8'));
 if(!Array.isArray(queue)||queue.length===0||!state.slots)error('Missing or invalid production queue/state');
 const pilotAttempts=Object.values(state.slots).filter(x=>x.attemptedAt||x.videoId).length;
 if(pilotAttempts>=1){console.log('One-video pilot limit reached; awaiting manual review.');return;}
 const key='whatif-'+day.date;
 let entry=state.slots[key];
 if(entry?.publicationId){console.log('This date is already scheduled by this pipeline.');return}
 if(!entry){
  const item=queue.find(q=>!Object.values(state.slots).some(x=>x.topicId===q.id));
  if(!item){console.log('Editorial queue exhausted; no credits spent.');return}
  const words=item.script.replace(/\[[^\]]*\]/g,' ').trim().split(/\s+/).length;
  if(words<55||words>83||!item.script.includes('['))error('Script needs 55-83 narration words and scene instructions');
  entry={topicId:item.id,title:item.title,phase:'reserved',createdAt:new Date().toISOString()};
  state.slots[key]=entry;save(state,'Reserve What If Short '+key);
 }
 const item=queue.find(x=>x.id===entry.topicId);
 if(!item)error('Reserved topic removed from queue');
 if(!Array.isArray(item.hashtags)||item.hashtags.length<2||item.hashtags.length>3||item.hashtags.some(tag=>!/^#[A-Za-z0-9]+$/.test(tag)))error('Provide 2–3 relevant hashtags');
 if(typeof item.thumbnailPrompt!=='string'||item.thumbnailPrompt.length<60||item.thumbnailPrompt.length>550)error('Thumbnail prompt missing or too long');
 if(typeof item.openingTitle!=='string'||item.openingTitle.length<8||item.openingTitle.length>60||item.openingTitleSeconds!==2.5)error('Opening title and 2.5-second target are required');
 const openingDirection='Clear professionally typeset overlay reading '+JSON.stringify(item.openingTitle)+' for the first 2.5 seconds, continuously readable, over LIVE MOVING ACTION, not a title card or frozen image. Keep the camera moving naturally and continue the narration. '; 
 const directedScript=item.script.replace(/^\[([^\]]+)\]/,(_,firstScene)=>'['+openingDirection+firstScene+']');
 if(directedScript===item.script)error('Opening scene is missing');
 console.log('Opening title target: '+item.openingTitle+' (2.5 sec); timing must be verified during manual video review');
 if(!entry.videoId){
  if(entry.attemptedAt)error('Generation request previously attempted; manual reconciliation required');
  entry.attemptedAt=new Date().toISOString();entry.phase='creating';
  save(state,'Prevent duplicate What If generation '+key);
  const created=await api('/videos/generate','POST',{script:directedScript,inputType:'script',mediaType:'video',videoQuality:'good',aspectRatio:'9:16',voiceSpeed:1.05,captionsEnabled:true,captionStyleId:'hormozi',thumbnail:{instructions:item.thumbnailPrompt}});
  const id=idFrom(created);
  if(!id||typeof id!=='string')error('No video ID in response. Do not automatically retry');
  entry.videoId=id;entry.phase='processing';
  save(state,'Store What If video ID '+key);
 }
 const deadline=Date.now()+12*60*1000;let ready=false;
 while(Date.now()<deadline){
  const v=await api('/videos/'+encodeURIComponent(entry.videoId));
  const status=String(v.status??v.video?.status??v.data?.status??'').toLowerCase();
  if(status==='completed'){ready=true;break}
  if(['failed','error','cancelled','canceled'].includes(status))error('Video generation failed');
  await sleep(10000);
 }
 if(!ready){console.log('Video still processing; next run can reuse saved ID');return}
 entry.phase='completed';save(state,'Confirm What If completion '+key);
 if(!autopublish){console.log('Video ready for review; auto-publish disabled. ID '+entry.videoId);return}
 const scheduled=osloAt16(day);
 if(scheduled.getTime()<Date.now()+60000)error('16:00 Oslo slot has passed; not publishing late');
 if(entry.publicationAttemptedAt)error('Publication attempted earlier; manual reconciliation required');
 entry.publicationAttemptedAt=new Date().toISOString();entry.phase='scheduling';
 save(state,'Prevent duplicate What If publication '+key);
 const posted=await api('/publications','POST',{videoId:entry.videoId,caption:item.caption+'\n\n'+item.hashtags.join(' '),publishNow:false,scheduledAt:scheduled.toISOString(),addMadeWithCaption:false,channels:[{channelId:youtubeId,title:item.title,tags:['what if','science','shorts',...item.hashtags.map(t=>t.slice(1).toLowerCase())],categoryId:'28',madeForKids:false}]});
 const pid=publicationId(posted);
 if(!pid||typeof pid!=='string')error('No publication ID in response. Do not retry automatically');
 entry.publicationId=pid;entry.phase='scheduled';entry.scheduledAt=scheduled.toISOString();
 save(state,'Schedule What If Short '+key);
 console.log('What If Short scheduled at '+scheduled.toISOString());
}
main().catch(e=>{console.error('Pipeline stopped safely: '+e.message);process.exitCode=1});
