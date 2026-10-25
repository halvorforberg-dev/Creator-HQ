// One-off What If talking dogs video; separate from existing Autopilot.
// No retries of uncertain charged generations or accepted publications.
const fs=require('fs'),cp=require('child_process');
const root='https://app.aituber.app/api/v1',token=process.env.AITUBER_API_KEY;
const stateFile='data/whatif-dogs-state.json',slot='2026-10-25-talking-dogs';
const youtubeId='UCUZ1h_XukdY1IQvwwuEnW0Q';
const prompt=`What if dogs could talk? Make a 38 to 40 second fully animated feel-good 3D family-comedy film, 9:16. TWO distinct dogs: Biscuit, a goofy golden retriever with a cheerful warm slightly deeper speaking voice, and Pixel, a quick-witted black-and-white border collie with a playful lighter speaking voice. In a sunny living room and leafy garden they SPEAK TO EACH OTHER in English, with clearly synchronized mouth movements and expressive eyes; not a static slideshow, no disembodied narrator, no talking-head freeze frames. Show lively walking, bouncing, tail wags, reaction shots and natural camera motion. Exact dialogue in the film: Biscuit saying: "You know what I love about humans? They throw the ball, then fetch it for me!" Pixel saying: "And they call us good dogs just for sitting. We are geniuses!" Biscuit saying: "Mine says every walk is exercise." Pixel saying: "Mine brings treats to the park. Who is training whom?" Biscuit saying: "Should we tell them we can talk?" Pixel saying: "Not before dinner!" Both laugh and their human smiles. Clean bright 3D animation, joyful original background music at low volume, clear speech and an upbeat satisfying ending. Opening title WHAT IF DOGS COULD TALK? stays visible over moving animation for 2.5 seconds. Character mouths must move during their own words and stay closed during the other's dialogue.`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const items=x=>Array.isArray(x)?x:(x?.channels??x?.videos??x?.items??x?.data?.channels??x?.data?.videos??x?.data?.items??x?.data??[]);
async function api(route,method='GET',payload){
 const r=await fetch(root+route,{method,headers:{Authorization:'Bearer '+token,Accept:'application/json',...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(35000)});
 const text=await r.text();let data;try{data=JSON.parse(text)}catch{data={message:text.slice(0,200)}}
 return {ok:r.ok,http:r.status,data};
}
function requireOk(r,where){if(!r.ok)throw Error(where+' HTTP '+r.http+': '+String(r.data.message??'').slice(0,200));return r.data}
function save(obj,msg){
 fs.writeFileSync(stateFile,JSON.stringify(obj,null,2)+'\n');
 cp.execFileSync('git',['config','user.name','github-actions[bot]']);
 cp.execFileSync('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
 cp.execFileSync('git',['add',stateFile]);
 let changed=false;try{cp.execFileSync('git',['diff','--cached','--quiet'])}catch{changed=true}
 if(changed){cp.execFileSync('git',['commit','-m',msg],{stdio:'pipe'});cp.execFileSync('git',['push','origin','HEAD:main'],{stdio:'pipe'})}
}
(async()=>{
 if(!token)throw Error('Missing API credential');
 const channels=items(requireOk(await api('/channels?platform=youtube'),'channels'));
 const correct=channels.filter(x=>(x.platformChannelId??x.youtubeChannelId)===youtubeId&&String(x.status??x.connectionStatus)==='connected');
 if(correct.length!==1)throw Error('Wrong or disconnected What If channel');
 const cId=correct[0].id??correct[0].channelId;
 const all=items(requireOk(await api('/videos'),'videos'));
 const matches=all.filter(x=>/what if dogs could talk|talking dogs|biscuit.*pixel/i.test(String(x.title??x.name??'')));
 if(matches.length){console.log('DOGS_ALREADY_EXISTS',JSON.stringify(matches.map(x=>({id:x.id,title:x.title,status:x.status}))));return}
 const sub=requireOk(await api('/subscription'),'subscription');
 const vals=[sub.creditsRemaining,sub.remainingCredits,sub.creditBalance,sub.credits?.remaining,sub.credits?.balance,sub.credits?.available,sub.data?.creditsRemaining,sub.data?.remainingCredits,sub.data?.credits?.remaining,sub.data?.credits?.balance,sub.data?.credits,sub.credits];
 const credits=vals.find(x=>typeof x==='number'&&Number.isFinite(x));
 console.log('CREDIT_GUARD',credits,'cost target approx 400, min reserve 400');
 if(credits===undefined||credits<800)throw Error('Not enough credits with safety reserve; no generation');
 let data;try{data=JSON.parse(fs.readFileSync(stateFile,'utf8'))}catch{data={slots:{}}}
 data.slots??={};let rec=data.slots[slot];
 if(!rec){rec={title:'What If Dogs Could Talk?',createdAt:new Date().toISOString(),phase:'reserved',youtubeId};data.slots[slot]=rec;save(data,'Reserve single What If talking dogs production')}
 if(!rec.videoId){
   if(rec.generationAttemptedAt)throw Error('Already attempted charged generation, no duplicate');
   rec.generationAttemptedAt=new Date().toISOString();rec.phase='generation-requested';save(data,'Block repeat What If dogs generation');
   const made=requireOk(await api('/videos/generate','POST',{
     script:prompt,inputType:'idea',expectedDurationSeconds:40,templateId:'character',videoQuality:'basic',
     aspectRatio:'9:16',captionsEnabled:true,captionStyleId:'pop',
     thumbnail:{instructions:'Cute polished 3D animated golden retriever and black-and-white border collie, looking at each other open-mouthed in animated conversation, joyful warm sunny garden, clear expressive faces, 9:16 vertical portrait, bold simple composition, no text and no logos.'}
   }),'generation');
   const id=made.videoId??made.id??made.data?.videoId??made.data?.id;
   if(!id)throw Error('Unknown charged generation outcome; no retries');
   rec.videoId=id;rec.phase='processing';save(data,'Save What If dogs video ID');
   console.log('DOGS_VIDEO_CREATED',id);
 }
 let completed=false;
 for(let i=0;i<96;i++){
   const r=requireOk(await api('/videos/'+rec.videoId),'video status');
   const v=r.video??r.data??r;
   const st=String(v.status??r.status??'').toLowerCase();
   if(st==='completed'){completed=true;break}
   if(['error','failed','canceled','cancelled'].includes(st))throw Error('Dog video generation failed');
   await sleep(10000);
 }
 if(!completed){console.log('DOGS_VIDEO_PENDING',rec.videoId);return}
 rec.phase='completed';save(data,'Confirm talking dogs video completed');
 // The character template generates native character audio/video. We cannot verify
 // perfect mouth sync via the metadata API; do not claim quality is visually reviewed.
 console.log('DOGS_VIDEO_COMPLETE_NOT_AUTOPUBLISHED',rec.videoId);
})().catch(e=>{console.error('DOGS_PRODUCTION_STOP',e.message);process.exitCode=1});
