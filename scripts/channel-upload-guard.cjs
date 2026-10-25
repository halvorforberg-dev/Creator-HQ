'use strict';
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'../data/channel-upload-policy.json');
const policy=JSON.parse(fs.readFileSync(file,'utf8'));
function validateChannelUpload({channelName,channelYouTubeId,channelPayload}){
 const c=policy.channels[channelName];
 if(!c)throw new Error('Unknown channel upload policy: '+channelName);
 if(String(channelYouTubeId)!==c.youtubeId)throw new Error(channelName+': YouTube channel mismatch — abort');
 if(!channelPayload||typeof channelPayload!=='object')throw new Error(channelName+': publishing channel settings missing');
 if(channelPayload.madeForKids!==c.madeForKidsDefault)throw new Error(channelName+': incorrect Made For Kids audience — expected '+c.madeForKidsDefault);
 if(c.categoryId && String(channelPayload.categoryId)!==c.categoryId)throw new Error(channelName+': incorrect YouTube category ID');
 if(!c.youtubeId)throw new Error(channelName+': YouTube ID missing from policy');
 return true;
}
module.exports={validateChannelUpload};
if(require.main===module){
 const cases=[
  ['bizarrePast',{madeForKids:false,categoryId:'27'}],
  ['whatIf',{madeForKids:false,categoryId:'28'}],
  ['littleWild',{madeForKids:true,categoryId:'1'}],
  ['highlights',{madeForKids:false,categoryId:'24'}]
 ];
 for(const [name,setting] of cases){
  const c=policy.channels[name];
  validateChannelUpload({channelName:name,channelYouTubeId:c.youtubeId,channelPayload:setting});
  let rejected=false;
  try{validateChannelUpload({channelName:name,channelYouTubeId:c.youtubeId,channelPayload:{...setting,madeForKids:!setting.madeForKids}})}catch{rejected=true}
  if(!rejected)throw new Error('Opposite audience not rejected for '+name);
 }
 console.log('Channel upload audience guard passed for all four channels.');
}