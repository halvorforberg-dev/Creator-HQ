// Safe, one-time resubmission after AI Tuber definitively rejected first attempt HTTP 402.
// User upgraded to Pro; never retry a charged/unknown outcome.
const fs=require('node:fs'),cp=require('node:child_process');
const apiRoot='https://app.aituber.app/api/v1',token=process.env.AITUBER_API_KEY;
const statePath='data/whatif-dogs-pro-retry.json';
const key='2026-10-25-whatif-dogs-pro-40s';
const channelYT='UCUZ1h_XukdY1IQvwwuEnW0Q';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sceneScript=[
  '[Vertical 9:16, bright 3D animated garden, fully moving camera. Dog 1 Biscuit, a golden retriever, and dog 2 Pixel, a black-and-white border collie. Lively realistic facial animation. Opening title WHAT IF DOGS COULD TALK? on screen for 2.5 seconds. Biscuit speaks next; his muzzle and mouth move naturally with EVERY word; Pixel listens with mouth closed.] What if dogs could talk? Biscuit said, Hey, Pixel! Humans throw balls so WE can bring them back. Who is training whom?',
  '[Quick close-up of Pixel the border collie speaking with visible lip movements, Biscuit listens silently. Both tails wag. Full-motion comedic 3D animation.] Pixel replied, I sit down for two seconds, and they call me a genius. Then they give me snacks!',
  '[Biscuit speaks while Pixel keeps his mouth shut and reacts playfully. Moving tracking shot through sunny garden.] Biscuit laughed, Mine walks around carrying all my treats. Such a good human!',
  '[Pixel answers, dog mouth clearly moves in sync. Biscuit looks mischievous.] Pixel whispered, Should we tell them we can talk?',
  '[Biscuit answers, moving muzzle. Pixel listens, then both playfully race toward dinner bowls in bright moving animation.] Biscuit grinned, Not before dinner! Best trick ever!'
].join(' ');
function creditBalance(s){return [s.creditsRemaining,s.remainingCredits,s.creditBalance,s.credits?.remaining,s.credits?.balance,s.credits?.available,s.data?.creditsRemaining,s.data?.remainingCredits,s.data?.credits?.remaining,s.data?.credits?.balance,s.data?.credits,s.credits].find(x=>typeof x==='number'&&Number.isFinite(x))}
function items(s){if(Array.isArray(s))return s;for(let v of [s,s?.data,s?.result])for(let k of ['videos','items','channels'])if(Array.isArray(v?.[k]))return v[k];return []}
async function api(url,method='GET',body){
 const res=await fetch(apiRoot+url,{method,headers:{Authorization:'Bearer '+token,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(35000)});
 const raw=await res.text();let obj;try{obj=JSON.parse(raw)}catch{obj={message:raw.slice(0,300)}}
 if(!res.ok)throw Error(url+' HTTP '+res.status+' '+JSON.stringify(obj).slice(0,350));
 return obj;
}
function save(state,message){
 fs.writeFileSync(statePath,JSON.stringify(state,null,2)+'\n');
 cp.execFileSync('git',['config','user.name','github-actions[bot]']);
 cp.execFileSync('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
 cp.execFileSync('git',['add',statePath]);
 let changed=false;try{cp.execFileSync('git',['diff','--cached','--quiet'])}catch{changed=true}
 if(changed){
  cp.execFileSync('git',['commit','-m',message],{stdio:'pipe'});
  // Retry a push only with rebasing, without ever repeating API generation.
  for(let i=0;i<3;i++){try{cp.execFileSync('git',['pull','--rebase','origin','main'],{stdio:'pipe'});cp.execFileSync('git',['push','origin','HEAD:main'],{stdio:'pipe'});return}catch(e){if(i===2)throw e}}
 }
}
(async()=>{
 if(!token)throw Error('API key is unavailable');
 const channels=items(await api('/channels?platform=youtube'));
 const found=channels.filter(x=>String(x.platformChannelId??x.youtubeChannelId)===channelYT&&String(x.status??x.connectionStatus)==='connected');
 if(found.length!==1)throw Error('What If Youtube channel missing or ambiguous');
 const subscription=await api('/subscription'),credits=creditBalance(subscription);
 const plan=subscription.plan?.name??subscription.plan??subscription.data?.plan?.name??'unknown';
 console.log('ACCOUNT',JSON.stringify({plan,credits}));
 if(credits===undefined||credits<850)throw Error('Need 470 credits plus 380 reserve');
 const existing=items(await api('/videos'));
 const duplicate=existing.find(x=>String(x.title??x.name??'').toLowerCase().startsWith('what if dogs could talk? biscuit said'));
 if(duplicate){console.log('ALREADY_EXISTS',JSON.stringify({id:duplicate.id,title:duplicate.title}));return}
 let st;try{st=JSON.parse(fs.readFileSync(statePath,'utf8'))}catch{st={tasks:{}}}
 st.tasks??={};let p=st.tasks[key];
 if(!p){p={phase:'reserved',createdAt:new Date().toISOString(),channelId:channelYT,title:'What If Dogs Could Talk? – 40 sec dialogue'};st.tasks[key]=p;save(st,'Reserve talking dogs Pro retry')}
 if(!p.videoId){
  if(p.generationAttemptedAt)throw Error('Already attempted; do not repeat charged API call');
  p.generationAttemptedAt=new Date().toISOString();p.phase='attempted';save(st,'Mark paid dogs Pro retry attempted');
  const payload={
   inputType:'script',script:sceneScript,templateId:'character',mediaType:'video',videoQuality:'good',
   aspectRatio:'9:16',voiceSpeed:1,captionsEnabled:true,captionStyleId:'pop',
   thumbnail:{instructions:'Fun vibrant 3D family animation, Golden Retriever Biscuit and black-and-white Border Collie Pixel face to face talking with expressive happy mouths, laughing on sunny grass, vertical YouTube Short composition, no writing.'}
  };
  const created=await api('/videos/generate','POST',payload);
  const vId=created.videoId??created.id??created.data?.videoId??created.data?.id;
  if(!vId)throw Error('Charged submission uncertain; do not retry');
  p.videoId=vId;p.phase='processing';save(st,'Record talking dogs Pro video id');
  console.log('VIDEO_CREATED',vId);
 }
 for(let i=0;i<78;i++){
  const r=await api('/videos/'+encodeURIComponent(p.videoId));
  const v=r.video??r.data??r;
  const phase=String(v.status??r.status??'').toLowerCase();
  if(phase==='completed'){
   const clips=(v.images??[]).filter(x=>x.videoUrl);
   const duration=clips.reduce((sum,x)=>sum+(Number(x.clipDurationSeconds)||0),0);
   p.phase='rendered-review-required';p.estimatedClipDuration=duration;p.completedAt=new Date().toISOString();
   p.sceneCount=clips.length;p.thumbnailStatus=v.thumbnail?.status??null;
   save(st,'Record completed talking dogs Pro video for quality review');
   console.log('VIDEO_COMPLETED',JSON.stringify({videoId:p.videoId,estimatedClipDuration:duration,sceneCount:clips.length,thumbnailStatus:p.thumbnailStatus}));
   return;
  }
  if(['failed','error','canceled','cancelled'].includes(phase))throw Error('Generation failed '+phase);
  await sleep(10000);
 }
 console.log('PROCESSING_CONTINUES',p.videoId);
})().catch(e=>{console.error('DOGS_PRO_RETRY_ERROR',e.message);process.exitCode=1});
