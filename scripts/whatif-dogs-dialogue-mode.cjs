// Correct documented AI Tuber 3D Talking Characters flow: IDEA prompt with "NAME saying:" dialogue.
// Earlier script-mode attempts produced only two 12-second clips. No automatic publication here.
const fs=require('fs'),cp=require('child_process'),token=process.env.AITUBER_API_KEY;
const root='https://app.aituber.app/api/v1';
const path='data/whatif-dogs-dialogue-mode.json';
const prompt="40s 3D talking dogs, vertical 9:16. Biscuit=golden retriever, warm male voice. Pixel=black-white collie, bright female voice. Sunny garden, synced moving lips for each speaker, animated closeups, wagging tails. Dialogue: Biscuit saying: You know what I love about humans? They throw the ball, then cheer when I bring it back. I think I've trained mine! Pixel saying: Mine calls me a genius just for sitting. Then I get a delicious treat! Biscuit saying: And humans carry all our toys to the park. They even pick up after us! Such thoughtful helpers! Pixel saying: We really should tell them we can talk. Wouldn't that surprise them? Biscuit saying: Not before dinner! I like getting extra treats without asking. Pixel saying: You're right. Let's start by ordering dessert!";
const sleep=n=>new Promise(resolve=>setTimeout(resolve,n));
function save(st,msg){
 fs.writeFileSync(path,JSON.stringify(st,null,2)+'\n');
 cp.execFileSync('git',['config','user.name','github-actions[bot]']);
 cp.execFileSync('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
 cp.execFileSync('git',['add',path]);let ch=false;try{cp.execFileSync('git',['diff','--cached','--quiet'])}catch{ch=true}
 if(ch){cp.execFileSync('git',['commit','-m',msg],{stdio:'pipe'});for(let n=0;n<3;n++)try{cp.execFileSync('git',['pull','--rebase','origin','main'],{stdio:'pipe'});cp.execFileSync('git',['push','origin','HEAD:main'],{stdio:'pipe'});return}catch(e){if(n===2)throw e}}
}
async function call(route,method='GET',body){
 const r=await fetch(root+route,{method,headers:{Authorization:'Bearer '+token,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(35000)});const t=await r.text();let v;try{v=JSON.parse(t)}catch{v={message:t.slice(0,100)}}
 if(!r.ok)throw Error('API '+route+' HTTP '+r.status+' '+String(v.message??'').slice(0,180));return v;
}
function credits(s){return [s.creditsRemaining,s.remainingCredits,s.creditBalance,s.credits?.remaining,s.credits?.balance,s.credits?.available,s.data?.creditsRemaining,s.data?.remainingCredits,s.data?.credits?.remaining,s.data?.credits?.balance,s.data?.credits,s.credits].find(x=>typeof x==='number'&&Number.isFinite(x))}
(async()=>{
 if(!token)throw Error('Key missing');
 if(prompt.length>800)throw Error('Idea prompt longer than max 800');
 const user=await call('/subscription');console.log('CREDITS',credits(user),'PLAN',user.plan?.name??user.plan);
 if(credits(user)<1200)throw Error('Need 600 to render and 600 reserve');
 const channels=await call('/channels?platform=youtube');const cs=Array.isArray(channels)?channels:(channels.channels??channels.data??channels.items??[]);
 if(!Array.isArray(cs)||!cs.some(x=>(x.platformChannelId??x.youtubeChannelId)==='UCUZ1h_XukdY1IQvwwuEnW0Q'&&x.status==='connected'))throw Error('What If target not connected');
 let st;try{st=JSON.parse(fs.readFileSync(path,'utf8'))}catch{st={}}
 if(!st.videoId){
  if(st.attemptedAt)throw Error('Already attempted charge; no duplicate');
  st.attemptedAt=new Date().toISOString();st.status='generation-attempted';st.mode='idea';st.targetDurationSeconds=40;st.title='What If Dogs Could Talk?';save(st,'Reserve talking dogs correct dialogue-mode generation');
  const made=await call('/videos/generate','POST',{script:prompt,inputType:'idea',expectedDurationSeconds:40,templateId:'character',videoQuality:'good',aspectRatio:'9:16',thumbnail:{instructions:'Bright funny polished 3D golden retriever Biscuit and black and white border collie Pixel facing each other, clearly talking in sunny garden with expressive happy eyes, vertical 9:16 no text'}});
  const videoId=made.videoId??made.id??made.data?.videoId??made.data?.id;
  if(!videoId)throw Error('Generation accepted without known id. Do not retry');
  st.videoId=videoId;st.status='processing';save(st,'Record 3D dialogue dogs video ID');
  console.log('DIALOGUE_VIDEO_CREATED',videoId);
 }
 for(let i=0;i<90;i++){
  const res=await call('/videos/'+encodeURIComponent(st.videoId)),v=res.video??res.data??res,status=String(v.status??res.status??'').toLowerCase();
  if(status==='completed'){
   const s=(v.images??[]).filter(x=>x.videoUrl),total=s.reduce((a,x)=>a+(Number(x.clipDurationSeconds)||0),0);
   st.status='rendered-needs-speech-quality-review';st.sceneCount=s.length;st.clipDuration=total;st.thumbnailStatus=v.thumbnail?.status??null;save(st,'Save completed 3D dialogue dogs render for review');
   console.log('DIALOGUE_VIDEO_COMPLETED',JSON.stringify({videoId:st.videoId,sceneCount:s.length,clipDuration:total,thumb:st.thumbnailStatus,hasNarration:!!v.audioUrl}));
   return;
  }
  if(['failed','error','canceled','cancelled'].includes(status))throw Error('Generation failed '+status);
  await sleep(10000);
 }
 console.log('DIALOGUE_STILL_PROCESSING',st.videoId);
})().catch(e=>{console.error('DIALOGUE_MODE_ERROR',e.message);process.exitCode=1});
