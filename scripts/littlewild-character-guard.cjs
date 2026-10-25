// Canonical character policy for NEW Little Wild Adventures videos.
// Uses the already-saved original-duo AI Tuber character element.
const fs = require('node:fs');
const path = require('node:path');
const lock = JSON.parse(fs.readFileSync(path.join(__dirname,'../data/littlewild-character-lock.json'),'utf8'));
const handle = '@'+lock.aiTuber.savedElement.handle;
function assertOriginalDuo(script){
  if(typeof script!=='string'||!script.trim()) throw new Error('Little Wild script missing');
  const scenes=[...script.matchAll(/\[([^\]]+)\]/g)].map(m=>m[1]);
  if(scenes.length===0) throw new Error('Little Wild requires bracketed animated scenes');
  for(let i=0;i<scenes.length;i++){
    if(!scenes[i].includes(handle)) throw new Error('Scene '+(i+1)+' lacks original saved duo reference '+handle);
  }
  const suspect=[
    /yellow\s+(?:colored\s+)?bird/i,
    /yellow\s+(?:primary\s+)?feathers/i,
    /bird\s+(?:is|was|becomes|turns)\s+yellow/i,
    /yellow\s+(?:wings|body|plumage)/i
  ];
  if(suspect.some(rx=>rx.test(script)))throw new Error('Little Wild character-color drift: bird must remain cyan/turquoise blue');
  return true;
}
function lockPrefix(){
 return '['+handle+'; use the EXACT originally saved duo from this reusable reference; bird body and crest vivid CYAN/TURQUOISE BLUE (never yellow), pale chest, orange beak/feet, small brown shoulder bag when appropriate; original golden-brown meerkat, cream belly, dark paws, amber eyes, explorer backpack when appropriate. Original 3D animation. Both characters remain identical across all scenes.] ';
}
module.exports={lock,handle,assertOriginalDuo,lockPrefix};
