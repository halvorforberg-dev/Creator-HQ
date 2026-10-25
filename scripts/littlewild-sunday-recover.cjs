// Safe recovery of one rejected Sunday publication. DOES NOT GENERATE OR SPEND VIDEO CREDITS.
// Original POST /publications was definitively rejected HTTP 400: wait for thumbnail.
const fs=require('fs'),cp=require('child_process');
const loc='data/littlewild-sunday-state.json';
const apiRoot='https://app.aituber.app/api/v1';
const key=process.env.AITUBER_API_KEY;
const videoId='0a955403-a28a-49d8-8066-b309ecb39907';
const targetYouTube='UCiey2ZXNP7Mb1hjmcKhrjcg';
const title='The Meerkat and the Runaway Kite | Little Wild Adventures';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const state=JSON.parse(fs.readFileSync(loc,'utf8'));
const job=state.jobs['littlewild-2026-10-25-kite'];
if(!job||job.videoId!==videoId)throw new Error('Unexpected state; abort');
function save(message){
 fs.writeFileSync(loc,JSON.stringify(state,null,2)+'\n');
 cp.execFileSync('git',['config','user.name','github-actions[bot]']);
 cp.execFileSync('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
 cp.execFileSync('git',['add',loc]);
 let has=false;try{cp.execFileSync('git',['diff','--cached','--quiet'])}catch{has=true}
 if(has){cp.execFileSync('git',['commit','-m',message],{stdio:'pipe'});cp.execFileSync('git',['push','origin','HEAD:main'],{stdio:'pipe'})}
}
async function req(route,method='GET',data){
 const r=await fetch(apiRoot+route,{method,headers:{Authorization:'Bearer '+key,Accept:'application/json',...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{}),signal:AbortSignal.timeout(35000)});
 const body=await r.text();let result;
 try{result=JSON.parse(body)}catch{result={message:body.slice(0,300)}}
 return {http:r.status,ok:r.ok,value:result};
}
function unpack(r){if(!r.ok)throw new Error('GET failed HTTP '+r.http);return r.value}
function list(o){if(Array.isArray(o))return o;for(let x of [o,o?.data,o?.result])for(let k of ['channels','items'])if(Array.isArray(x?.[k]))return x[k];return []}
function status(x){return String(x?.status??x?.data?.status??x?.publication?.status??'').toLowerCase()}
(async()=>{
 if(!key)throw new Error('No API key');
 if(job.publicationId){console.log('ALREADY_SUBMITTED',job.publicationId);return}
 if(job.recoveryAttemptedAt){console.log('RECOVERY_ALREADY_ATTEMPTED',job.recoveryAttemptedAt);return}
 const c=list(unpack(await req('/channels?platform=youtube')));
 const match=c.filter(x=>(x.platformChannelId??x.youtubeChannelId)===targetYouTube&&String(x.status??x.connectionStatus)==='connected');
 if(match.length!==1)throw new Error('Correct channel not connected');
 const cid=match[0].id??match[0].channelId;
 const current=unpack(await req('/videos/'+videoId));
 const video=current.video??current.data??current;
 const phase=String(video.status??current.status).toLowerCase();
 if(phase!=='completed')throw new Error('Video not completed: '+phase);
 console.log('VIDEO_CHECK',JSON.stringify({id:videoId,status:phase,thumbnailStatus:video.thumbnailStatus??current.thumbnailStatus,thumbnailReady:video.thumbnailReady??current.thumbnailReady,thumbnailKeys:Object.keys(video).filter(x=>/thumbnail|cover|export/i.test(x))}));
 let approved=false;
 for(let n=0;n<36;n++){
   const r=unpack(await req('/videos/'+videoId));
   const v=r.video??r.data??r;
   const thumb=String(v.thumbnailStatus??r.thumbnailStatus??'').toLowerCase();
   if(['completed','ready','success','succeeded'].includes(thumb)){console.log('THUMBNAIL_READY',thumb);approved=true;break}
   if(n>=3 && !thumb){console.log('THUMBNAIL_STATUS_NOT_EXPOSED waiting then attempting');approved=true;break}
   console.log('THUMBNAIL_WAIT',thumb||'unspecified');await sleep(15000);
 }
 if(!approved){console.log('THUMBNAIL_NOT_CONFIRMED');return}
 const payload={videoId,caption:'Milo the meerkat and Pip the little bird chase a runaway kite across the meadow, and discover that teamwork makes every adventure better! A cheerful animated story for families.\n\n#LittleWildAdventures #AnimatedStories #CuteAnimals',addMadeWithCaption:false,publishNow:true,channels:[{channelId:cid,title,tags:['Little Wild Adventures','animated story','meerkat','cute bird','kids animation','friendship','kite'],categoryId:'1',madeForKids:true}]};
 job.recoveryAttemptedAt=new Date().toISOString();job.phase='publication-retry';save('Mark single safe Little Wild publication recovery attempt');
 const posted=await req('/publications','POST',payload);
 if(!posted.ok){job.recoveryError='HTTP '+posted.http+' '+String(posted.value?.message??'').slice(0,160);job.phase='publication-rejected';save('Record Little Wild publication validation rejection');throw new Error('Publishing rejected '+job.recoveryError)}
 const pubId=posted.value?.publicationId??posted.value?.id??posted.value?.data?.publicationId??posted.value?.data?.id;
 if(!pubId)throw new Error('Uncertain success, no pub id; do not resubmit');
 job.publicationId=pubId;job.phase='submitted';save('Store confirmed Sunday Little Wild publication id');
 console.log('PUBLICATION_ACCEPTED',pubId);
 for(let i=0;i<60;i++){
   const check=await req('/publications/'+encodeURIComponent(pubId));
   if(!check.ok){console.log('PUBLICATION_STATUS_HTTP',check.http);await sleep(10000);continue}
   const p=check.value?.data??check.value;
   const st=status(p);
   if(i%6===0)console.log('PUBLISH_STATUS',st);
   if(st==='published'){job.phase='published';job.publishedAt=new Date().toISOString();job.publicUrl=p.publicUrl??p.url??p.publication?.publicUrl??null;save('Confirm Sunday Little Wild published on YouTube');console.log('PUBLISHED',JSON.stringify({videoId,publicationId:pubId,publicUrl:job.publicUrl}));return}
   if(['failed','error','cancelled','canceled'].includes(st)){job.phase='failed';save('Record Sunday Little Wild publication failure');throw new Error('Publication failed '+st)}
   await sleep(10000);
 }
 console.log('PUBLICATION_SUBMITTED_STILL_PENDING',pubId);
})().catch(e=>{console.error('RECOVERY_STOP',e.message);process.exitCode=1});
