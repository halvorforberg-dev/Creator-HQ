// Opening hook contract for NEW What If and Bizarre Past films.
// Static validation cannot prove final audio/video; ALWAYS manually review exported first seconds.
'use strict';
const channels={
  whatif:{spoken:/^what\s+if\b/i,title:/^what\s+if\b/i,label:'What If'},
  bizarre:{spoken:/^did\s+you\s+know\b/i,title:/^did\s+you\s+know\b/i,label:'Bizarre Past'}
};
function removeFirstSceneDirections(script){
  // AI Tuber/Higgsfield screenplay directions appear inside opening [brackets].
  return script.replace(/^\s*(?:\[[^\]]*\]\s*)+/,'').trim();
}
function validateOpeningHook({channel,script,openingTitle,openingTitleSeconds}){
  const c=channels[channel];
  if(!c)throw new Error('Unknown channel for opening hook: '+channel);
  if(typeof script!=='string'||!script.trim())throw new Error(c.label+': opening spoken script is missing');
  if(typeof openingTitle!=='string'||!openingTitle.trim())throw new Error(c.label+': on-screen opening title is missing');
  const spoken=removeFirstSceneDirections(script).replace(/^[\s"'“”‘’]+/,'');
  const title=openingTitle.trim().replace(/^[\s"'“”‘’]+/,'');
  if(!c.spoken.test(spoken))throw new Error(c.label+': FIRST SPOKEN words MUST start with '+(channel==='whatif'?'"What if ..."':'"Did you know ..."')+'; got '+spoken.slice(0,90));
  if(!c.title.test(title))throw new Error(c.label+': FIRST on-screen text MUST start with '+(channel==='whatif'?'"WHAT IF ..."':'"DID YOU KNOW ..."')+'; got '+title.slice(0,90));
  if(typeof openingTitleSeconds!=='number'||openingTitleSeconds<2||openingTitleSeconds>3)throw new Error(c.label+': first on-screen hook must be legible for 2–3 seconds');
  if(!/^\s*\[/.test(script))throw new Error(c.label+': first scene must direct moving imagery at 0:00');
  return {ok:true,channel,openingTitleSeconds,firstWords:spoken.split(/\s+/).slice(0,7).join(' ')};
}
module.exports={validateOpeningHook,removeFirstSceneDirections};
if(require.main===module){
  const tests=[
    {channel:'whatif',script:'[Animated close-up of dogs talking] What if dogs could talk?',openingTitle:'WHAT IF DOGS COULD TALK?',openingTitleSeconds:2.5},
    {channel:'bizarre',script:'[Dramatic reenactment starts in motion] Did you know that one pig nearly started a war?',openingTitle:'DID YOU KNOW A PIG ALMOST STARTED A WAR?',openingTitleSeconds:2.5}
  ];
  for(const test of tests)validateOpeningHook(test);
  for(const channel of ['whatif','bizarre']){
    const wrong={channel,script:'[Action] Imagine if everything changed.',openingTitle:channel==='whatif'?'WHAT IF THIS HAPPENED?':'DID YOU KNOW THIS?',openingTitleSeconds:2.5};
    let rejected=false;try{validateOpeningHook(wrong)}catch{rejected=true}
    if(!rejected)throw new Error('Expected failure for '+channel+' wrong spoken opening');
  }
  console.log('Opening hook guard self-check passed');
}
