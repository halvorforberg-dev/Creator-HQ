// Explicitly approved one-off corrective AI Tuber productions.
// Never resubmit a charge after an unknown response; never auto-publish before checks.
const fs=require('node:fs'),cp=require('node:child_process');
const base='https://app.aituber.app/api/v1';
const token=process.env.AITUBER_API_KEY;
const brief=JSON.parse(fs.readFileSync('data/2026-10-25-remake-brief.json','utf8'));
const path='data/2026-10-25-remake-state.json';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function save(o,msg){
 fs.writeFileSync(path,JSON.stringify(o,null,2)+'\n');
 for(const [k,v] of [['user.name','github-actions[bot]'],['user.email','41898282+github-actions[bot]@users.noreply.github.com']])cp.execFileSync('git',['config',k,v]);
 cp.execFileSync('git',['add',path]);
 let changed=false;try{cp.execFileSync('git',['diff','--cached','--quiet'])}catch{changed=true}
 if(changed){cp.execFileSync('git',['commit','-m',msg],{stdio:'pipe'});cp.execFileSync('git',['pull','--rebase','origin','main'],{stdio:'pipe'});cp.execFileSync('git',['push','origin','HEAD:main'],{stdio:'pipe'})}
}
async function req(url,method='GET',body){
 const r=await fetch(base+url,{method,headers:{Authorization:'Bearer '+token,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(35000)});
 const txt=await r.text();let v;try{v=JSON.parse(txt)}catch{v={message:txt.slice(0,300)}}
 if(!r.ok)throw Error(url+' HTTP '+r.status+' '+JSON.stringify(v).slice(0,300));
 return v;
}
const array=(v,k)=>{if(Array.isArray(v))return v;for(let o of [v,v?.data,v?.result])for(let x of k)if(Array.isArray(o?.[x]))return o[x];return []};
function id(v){return v.videoId??v.id??v.video?.id??v.data?.videoId??v.data?.id}
function credits(x){return [x.creditsRemaining,x.remainingCredits,x.creditBalance,x.credits?.remaining,x.credits?.balance,x.credits?.available,x.data?.creditsRemaining,x.data?.remainingCredits,x.data?.credits?.remaining,x.data?.credits?.balance,x.data?.credits,x.credits].find(v=>typeof v==='number'&&Number.isFinite(v))}
(async()=>{
 if(!token)throw Error('Missing AITUBER_API_KEY');
 let st;try{st=JSON.parse(fs.readFileSync(path,'utf8'))}catch{st={tasks:{}}}
 st.tasks??={};
 const channels=array(await req('/channels?platform=youtube'),['channels','items']);
 const existing=array(await req('/videos'),['videos','items']);
 for(const key of ['wild','dogs']){
   const b=brief[key],slot=b.idempotencyKey;
   const matches=channels.filter(c=>(c.platformChannelId??c.youtubeChannelId)===b.channelYoutubeId&&String(c.status??c.connectionStatus)==='connected');
   if(matches.length!==1)throw Error(key+' missing exact connected YouTube channel');
   const old=existing.find(v=>String(v.title??v.name??'').toLowerCase()===b.title.toLowerCase());
   if(old){console.log('EXISTING_VIDEO_SIMILAR',key,id(old));continue}
   const credit=credits(await req('/subscription'));
   console.log('CREDITS_BEFORE',key,credit);
   const minRequired=key==='wild'?530:260;
   if(credit===undefined||credit<minRequired){console.log('SKIPPED_CREDIT_GUARD',key);continue}
   let current=st.tasks[slot];
   if(!current){current={phase:'reserved',title:b.title,youtubeId:b.channelYoutubeId,createdAt:new Date().toISOString()};st.tasks[slot]=current;save(st,'Reserve corrective '+key+' video')}
   if(!current.videoId){
     if(current.generationAttemptedAt){console.log('NO_REPEAT_CHARGED_SUBMISSION',key);continue}
     current.generationAttemptedAt=new Date().toISOString();current.phase='generation-requested';save(st,'Mark corrective '+key+' generation attempted');
     const payload={script:b.script,inputType:'script',templateId:'character',mediaType:'video',videoQuality:'basic',aspectRatio:b.aspectRatio,captionsEnabled:true,captionStyleId:'pop',voiceSpeed:1.0,thumbnail:{instructions:key==='wild'?'Two EXACT originally saved Little Wild Adventures character mascots: small bright CYAN TURQUOISE BLUE crested bird with orange beak and sandy golden-brown meerkat with amber eyes, in bright 3D meadow flying a green leaf kite, joyous family adventure, landscape composition, no yellow bird.':'Two expressive 3D talking dogs (friendly golden retriever Biscuit and black-white border collie Pixel) facing each other in a bright sunny garden, mouths moving in conversation, hilarious family comedy, dynamic vertical framing.'}};
     const created=await req('/videos/generate','POST',payload);
     const videoId=id(created);
     if(!videoId)throw Error('Charged generation returned no video ID; do not retry');
     current.videoId=videoId;current.phase='processing';save(st,'Save corrective '+key+' video ID');
     console.log('VIDEO_CREATED',key,videoId);
   }
   let complete=false;
   for(let n=0;n<90;n++){
     let v=await req('/videos/'+encodeURIComponent(current.videoId)),data=v.video??v.data??v;
     const stat=String(data.status??v.status??'').toLowerCase();
     if(stat==='completed'){complete=true;break}
     if(['error','failed','canceled','cancelled'].includes(stat))throw Error(key+' failed '+stat);
     await sleep(10000);
   }
   if(!complete){console.log('PROCESSING_CONTINUES',key,current.videoId);continue}
   current.phase='generated-awaiting-visual-and-publishing-check';
   current.completedAt=new Date().toISOString();save(st,'Complete corrective '+key+' video, hold for quality checks');
   console.log('VIDEO_COMPLETED',key,current.videoId);
 }
})().catch(e=>{console.error('REMAKE_ERROR',e.message);process.exitCode=1});
