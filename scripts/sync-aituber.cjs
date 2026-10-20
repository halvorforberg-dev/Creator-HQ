const fs=require('fs');
const token=process.env.AITUBER_API_KEY;
if(!token){console.error('AITUBER_API_KEY is not configured');process.exit(1)}
async function run(){
 const res=await fetch('https://app.aituber.app/api/v1/videos',{headers:{Authorization:'Bearer '+token,Accept:'application/json'},signal:AbortSignal.timeout(20000)});
 if(!res.ok){console.error('AITuber read endpoint returned HTTP '+res.status+' (list access may not be enabled)');process.exit(1)}
 const body=await res.json();
 const list=Array.isArray(body)?body:Array.isArray(body.videos)?body.videos:Array.isArray(body.data)?body.data:Array.isArray(body.items)?body.items:null;
 if(!list){console.error('AITuber response does not contain a recognized video list; refusing to overwrite previous data');process.exit(1)}
 const safe=list.slice(0,250).map(v=>({id:String(v.id??v.videoId??''),title:String(v.title??v.name??'Uten tittel').slice(0,160),status:String(v.status??'ukjent').slice(0,60),createdAt:typeof v.createdAt==='string'?v.createdAt:null,scheduledAt:typeof v.scheduledAt==='string'?v.scheduledAt:null,channelName:typeof v.channelName==='string'?v.channelName.slice(0,100):null,channelId:v.channelId?String(v.channelId):null})).filter(v=>v.id);
 fs.mkdirSync('data',{recursive:true});
 fs.writeFileSync('data/aituber.json',JSON.stringify({updatedAt:new Date().toISOString(),source:'AITuber API read-only',mappingStatus:'Channel mapping pending verification',items:safe},null,2)+'\n');
 console.log('Read-only AI Tuber sync: '+safe.length+' items');
}
run().catch(e=>{console.error('AI Tuber sync failed: '+e.name);process.exit(1)});
