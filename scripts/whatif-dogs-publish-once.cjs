// Publish only the validated original 42-second AI Tuber 3D Talking Characters render.
// No charge-retries or duplicate POST when submission outcome is uncertain.
const fs=require('fs'),cp=require('child_process');
const path='data/whatif-dogs-dialogue-mode.json';
const videoId='359192ea-04ef-4eb9-ad92-53be956fac3e';
const channelYt='UCUZ1h_XukdY1IQvwwuEnW0Q';
const base='https://app.aituber.app/api/v1';
const token=process.env.AITUBER_API_KEY;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const st=JSON.parse(fs.readFileSync(path,'utf8'));
function save(note){
 fs.writeFileSync(path,JSON.stringify(st,null,2)+'\n');
 cp.execFileSync('git',['config','user.name','github-actions[bot]']);
 cp.execFileSync('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
 cp.execFileSync('git',['add',path]);let dirty=false;try{cp.execFileSync('git',['diff','--cached','--quiet'])}catch{dirty=true}
 if(dirty){cp.execFileSync('git',['commit','-m',note],{stdio:'pipe'});for(let i=0;i<4;i++){try{cp.execFileSync('git',['pull','--rebase','origin','main'],{stdio:'pipe'});cp.execFileSync('git',['push','origin','HEAD:main'],{stdio:'pipe'});return}catch(e){if(i===3)throw e}}}
}
async function req(url,method='GET',data){
 const r=await fetch(base+url,{method,headers:{Authorization:'Bearer '+token,Accept:'application/json',...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{}),signal:AbortSignal.timeout(30000)});
 const raw=await r.text();let value;try{value=JSON.parse(raw)}catch{value={message:raw.slice(0,160)}}
 if(!r.ok)throw Error(url+' HTTP '+r.status+' '+JSON.stringify(value).slice(0,500));
 return value;
}
function values(x,k){if(Array.isArray(x))return x;for(const i of [x,x?.data,x?.result])for(const j of k)if(Array.isArray(i?.[j]))return i[j];return []}
(async()=>{
 if(!token)throw Error('AI Tuber credential missing');
 if(st.videoId!==videoId)throw Error('Video mismatch, abort');
 if(st.publicationId){console.log('ALREADY_POSTED',st.publicationId);return}
 if(st.publishAttemptedAt)throw Error('Publication already attempted, no duplicate');
 const channels=values(await req('/channels?platform=youtube'),['channels','items']);
 const channel=channels.filter(x=>(x.platformChannelId??x.youtubeChannelId)===channelYt&&String(x.status??x.connectionStatus)==='connected');
 if(channel.length!==1)throw Error('Exact intended What If YouTube channel not uniquely connected');
 const detail=await req('/videos/'+videoId),v=detail.video??detail.data??detail;
 const clips=(v.images??[]).filter(x=>x.videoUrl);
 const sec=clips.reduce((n,x)=>n+Number(x.clipDurationSeconds||0),0);
 if(sec<35||sec>50||clips.length<5||v.templateId!=='character')throw Error('Not quality-approved length or correct template');
 if(String(v.thumbnail?.status).toLowerCase()!=='ready')throw Error('Thumbnail not ready');
 if(!v.audioUrl && clips.length<5)throw Error('No verified speech media');
 const desc='What if dogs could TALK? 🐶 Biscuit the golden retriever and Pixel the border collie discover who is really training whom! Funny, wholesome talking-dog animation with a surprising dinner-time punchline.\n\nOriginal AI-generated 3D animation.\n\n#WhatIf #TalkingDogs #FunnyDogs #DogShorts #Shorts #GoodVibes';
 const payload={videoId,caption:desc,addMadeWithCaption:false,publishNow:true,channels:[{channelId:channel[0].id,title:'What If Dogs Could Talk? 🐶😂 | Biscuit & Pixel',tags:['What If Dogs Could Talk','Talking Dogs','Funny Dogs','Dog Conversation','AI Animation','What If in 40 Seconds','Shorts'],categoryId:'24',madeForKids:false}]};
 st.publishAttemptedAt=new Date().toISOString();st.status='publishing';save('Mark unique What If dogs publishing attempt');
 const r=await req('/publications','POST',payload);
 const first=values(r,['publications'])[0];
 const pubId=first?.publicationId??r.publicationId??r.id;
 if(!pubId){console.log('PUBLISH_RESPONSE',JSON.stringify(r).slice(0,1000));throw Error('Publication accepted without parsed ID; do NOT repeat')}
 st.publicationId=pubId;st.status=first?.status??'submitted';save('Record unique What If dogs AITuber publication ID');
 console.log('UPLOAD_ACCEPTED',JSON.stringify({id:pubId,phase:st.status,videoId}));
 for(let i=0;i<50;i++){
  const x=await req('/publications/'+encodeURIComponent(pubId));
  const s=x.publication??x.data??x,phase=String(s.status??x.status??'').toLowerCase();
  if(i%5===0)console.log('UPLOAD_STATUS',JSON.stringify({phase,url:s.publicUrl??s.url??null}));
  if(phase==='published'){st.status='published';st.youtubeUrl=s.publicUrl??s.url??null;st.publishedAt=new Date().toISOString();save('Confirm public What If Dogs YouTube upload');console.log('YOUTUBE_PUBLISHED',JSON.stringify({publicationId:pubId,publicUrl:st.youtubeUrl}));return}
  if(['failed','error','canceled','cancelled'].includes(phase)){st.status='publication-failed';save('Record failed What If dogs upload');throw Error('YouTube upload failed '+phase)}
  await sleep(7000);
 }
 console.log('UPLOAD_STILL_PENDING',pubId);
})().catch(e=>{console.error('UPLOAD_ERROR',e.message);process.exitCode=1});
