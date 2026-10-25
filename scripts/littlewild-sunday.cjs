// One-off, guarded Little Wild Adventures production for 2026-10-25.
// Runs only from manual/one-off workflow. Never edits existing videos or autopilots.
const fs=require('fs');
const cp=require('child_process');
const path='data/littlewild-sunday-state.json';
const root='https://app.aituber.app/api/v1';
const token=process.env.AITUBER_API_KEY;
const storyTitle='The Meerkat and the Runaway Kite';
const dayKey='littlewild-2026-10-25-kite';
const channelYouTubeId='UCiey2ZXNP7Mb1hjmcKhrjcg';
const story=[
  '[Bright 3D animated meadow in full motion. A cute sandy meerkat named Milo and small yellow bird named Pip with a blue wing stripe. The camera glides forward. Large clear opening text THE RUNAWAY KITE remains for 2.5 seconds over moving animation.] It was the sunniest morning in the meadow, and Milo the meerkat had a very important plan.',
  '[Milo rolls out a giant green leaf-shaped kite while Pip flaps excitedly beside him.] Today he was going to fly the biggest, brightest kite the meadow had ever seen. His best friend Pip thought it was a brilliant idea.',
  '[Milo runs through the tall grass holding the kite. A soft breeze lifts it into the blue sky, and Pip flies circles around it.] Up went the kite, dancing over the flowers. Milo laughed and waved both paws.',
  '[A playful gust tugs the string from Milo\'s paw. The green kite glides gently past a duck pond, not touching the water.] But then a mischievous gust of wind whisked the string away. Oh no! Milo called. Come back, kite!',
  '[Pip swoops ahead and Milo follows across a little wooden bridge. A family of ducks watches in amusement.] Pip chirped, Follow me! The two friends hurried after the runaway kite as it floated toward a hill of daisies.',
  '[The kite is caught harmlessly on the highest branch of a small apple tree. Milo looks up. Pip perches on his head.] Milo stretched as tall as he could. He jumped once, then twice. But the kite was still far above his paws.',
  '[Pip has an idea, flutters to a low branch, and nudges the string with her beak. Milo carefully steadies the branch from the ground.] Pip spotted the loose string and gently pushed it toward Milo. Together they caught it without breaking a single leaf.',
  '[The friends celebrate with an adorable little dance. The kite is safely in Milo\'s paws.] We did it! Milo cheered. Pip chirped a happy tune, and the ducks joined in with a very silly quacking chorus.',
  '[Golden afternoon light over the meadow. Milo ties the kite string gently to a sturdy wooden spool; Pip circles as it flies. Soft warm music, smooth animation and joyful ending.] This time Milo held the spool tightly. The kite soared higher than ever. And Milo learned that the best adventures are even better with a friend by your side.'
].join(' ');
function items(x,k){if(Array.isArray(x))return x;for(const o of [x,x?.data,x?.result])for(const a of k)if(Array.isArray(o?.[a]))return o[a];return []}
async function api(route,method='GET',body){
 const r=await fetch(root+route,{method,headers:{Authorization:'Bearer '+token,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(35000)});
 const t=await r.text();
 let o={};try{o=t?JSON.parse(t):{}}catch{}
 if(!r.ok)throw new Error('AITuber '+route+' HTTP '+r.status+' '+JSON.stringify(o).slice(0,600));
 return o;
}
function state(){try{return JSON.parse(fs.readFileSync(path,'utf8'))}catch{return {jobs:{}}}}
function save(v,desc){
 fs.mkdirSync('data',{recursive:true});
 fs.writeFileSync(path,JSON.stringify(v,null,2)+'\n');
 cp.execFileSync('git',['config','user.name','github-actions[bot]']);
 cp.execFileSync('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
 cp.execFileSync('git',['add',path]);
 let changes=false;try{cp.execFileSync('git',['diff','--cached','--quiet'])}catch{changes=true}
 if(changes){cp.execFileSync('git',['commit','-m',desc],{stdio:'pipe'});cp.execFileSync('git',['push','origin','HEAD:main'],{stdio:'pipe'})}
}
const status=x=>String(x?.status??x?.video?.status??x?.data?.status??'').toLowerCase();
function id(x){return x?.videoId??x?.id??x?.data?.videoId??x?.data?.id??x?.video?.id}
function pid(x){return x?.publicationId??x?.id??x?.data?.publicationId??x?.data?.id??x?.publications?.[0]?.id}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 if(!token)throw new Error('Missing AITUBER_API_KEY');
 const channels=items(await api('/channels?platform=youtube'),['channels','items']);
 const selected=channels.filter(c=>String(c.platform??c.platformType).toLowerCase()==='youtube' &&
   String(c.platformChannelId??c.youtubeChannelId)==channelYouTubeId &&
   String(c.status??c.connectionStatus).toLowerCase()==='connected');
 if(selected.length!==1)throw new Error('Correct Little Wild YouTube channel not uniquely connected');
 const channelId=selected[0].id??selected[0].channelId;
 const existing=items(await api('/videos'),['videos','items']);
 const duplicate=existing.find(v=>String(v.title??v.name??'').toLowerCase().includes('runaway kite'));
 if(duplicate){console.log('EXISTING_SIMILAR_VIDEO',JSON.stringify({videoId:id(duplicate),title:duplicate.title,status:duplicate.status}));throw new Error('Similar existing video needs manual reconciliation; refusing duplicate')}
 const sub=await api('/subscription');
 const options=[sub.creditsRemaining,sub.remainingCredits,sub.creditBalance,sub.credits?.remaining,sub.credits?.balance,sub.credits?.available,sub.data?.creditsRemaining,sub.data?.remainingCredits,sub.data?.credits?.remaining,sub.data?.credits?.balance,sub.data?.credits,sub.credits];
 const credits=options.find(n=>typeof n==='number'&&Number.isFinite(n));
 const wordCount=story.replace(/\[[^\]]*\]/g,'').trim().split(/\s+/).length;
 const estimatedSeconds=Math.round(wordCount/2.65);
 const estimatedCredits=Math.ceil(estimatedSeconds*5.5);
 console.log('STORY',storyTitle,'spokenWords',wordCount,'estimatedSeconds',estimatedSeconds,'estimatedCredits',estimatedCredits,'creditBalance',credits);
 if(credits===undefined||credits<estimatedCredits+600||estimatedCredits>650)throw new Error('Credit budget/remaining reserve guard stopped production');
 if(estimatedSeconds<65||estimatedSeconds>115)throw new Error('Script outside 1-2 minute length bounds');
 const st=state();st.jobs??={};
 let job=st.jobs[dayKey];
 if(!job){
   job={title:storyTitle,phase:'reserved',createdAt:new Date().toISOString(),channelYouTubeId};
   st.jobs[dayKey]=job;save(st,'Reserve Sunday Little Wild to prevent double charges');
 }
 if(!job.videoId){
   if(job.generationAttemptedAt)throw new Error('Generation already attempted. Reconcile manually, no duplicate charge');
   job.generationAttemptedAt=new Date().toISOString();job.phase='generating';save(st,'Mark Little Wild generation attempted');
   const previous=existing.find(v=>String(v.title??v.name??'').includes('Snail'));
   let previousConfig={};if(previous){try{previousConfig=await api('/videos/'+encodeURIComponent(id(previous)))}catch(e){console.log('Previous voice lookup unavailable')}}
   const v=previousConfig.video??previousConfig.data??previousConfig;
   const payload={
     script:story,inputType:'script',mediaType:'video',videoQuality:'basic',aspectRatio:'16:9',
     voiceSpeed:1.03,captionsEnabled:true,captionStyleId:'pop',
     thumbnail:{instructions:'Bright professional 3D animated family adventure thumbnail. Expressive sandy meerkat and tiny cheerful yellow bird with blue wing stripe looking up at a huge green leaf-shaped kite above sunny flower meadow. Joyful friendship, vibrant color, 16:9 framing, no logos or unreadable text.'}
   };
   if(typeof v.voiceId==='string'&&v.voiceId.length>1)payload.voiceId=v.voiceId;
   const made=await api('/videos/generate','POST',payload);
   const videoId=id(made);
   if(!videoId||typeof videoId!=='string')throw new Error('Generation uncertain; do not repeat paid request');
   job.videoId=videoId;job.phase='processing';save(st,'Save Little Wild generated video id');
   console.log('VIDEO_CREATED',videoId);
 }
 let ready=false;
 for(let n=0;n<96;n++){
   const video=await api('/videos/'+encodeURIComponent(job.videoId));
   const current=status(video);
   if(current==='completed'){ready=true;break}
   if(['failed','error','cancelled','canceled'].includes(current))throw new Error('Generation failed: '+current);
   await sleep(10000);
 }
 if(!ready){console.log('VIDEO_STILL_PROCESSING',job.videoId);return}
 job.phase='completed';save(st,'Confirm Little Wild generation completed');
 const currentDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 if(currentDate!=='2026-10-25'){console.log('SUNDAY_HAS_PASSED_NO_LATE_PUBLICATION',job.videoId);return}
 if(job.publicationAttemptedAt){console.log('PUBLICATION_ALREADY_ATTEMPTED',job.videoId);return}
 job.publicationAttemptedAt=new Date().toISOString();job.phase='publishing';save(st,'Prevent duplicate Little Wild publication');
 const request={
   videoId:job.videoId,caption:'Milo the meerkat and Pip the little bird chase a runaway kite across the meadow, and discover that teamwork makes every adventure better! A cheerful animated story for families.\n\n#LittleWildAdventures #AnimatedStories #CuteAnimals',
   addMadeWithCaption:false,publishNow:true,
   channels:[{channelId,title:storyTitle+' | Little Wild Adventures',tags:['Little Wild Adventures','animated story','meerkat','cute bird','kids animation','friendship','kite'],categoryId:'1',madeForKids:true}]
 };
 const post=await api('/publications','POST',request);
 const pubId=pid(post);
 if(!pubId||typeof pubId!=='string')throw new Error('Publish outcome uncertain: do not submit again');
 job.publicationId=pubId;job.phase='submitted';save(st,'Save Little Wild YouTube publication id');
 console.log('PUBLICATION_SUBMITTED',pubId,'VIDEO',job.videoId);
 for(let n=0;n<32;n++){
   const p=await api('/publications/'+encodeURIComponent(pubId));
   const current=status(p);
   console.log('PUBLICATION_STATUS',current);
   if(current==='published'){job.phase='published';job.publishedAt=new Date().toISOString();job.publicUrl=p.publicUrl??p.url??p.data?.publicUrl??null;save(st,'Confirm Little Wild YouTube published');console.log('PUBLISHED',JSON.stringify({videoId:job.videoId,publicationId:pubId,publicUrl:job.publicUrl}));return}
   if(['failed','error','cancelled','canceled'].includes(current)){job.phase='failed';save(st,'Record Little Wild publication failure');throw new Error('YouTube publication failed '+current)}
   await sleep(10000);
 }
 console.log('PUBLICATION_PENDING',pubId,'VIDEO',job.videoId);
})().catch(e=>{console.error('GUARDED_PRODUCTION_STOP',e.message);process.exitCode=1});
