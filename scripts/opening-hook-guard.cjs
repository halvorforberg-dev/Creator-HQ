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

/**
 * Validate an AI Tuber "3D Talking Characters" IDEA prompt.
 *
 * The text before the first "NAME saying:" directive is production direction,
 * not audible speech. This catches the previously published 42-second dogs
 * failure: a visually good film whose FIRST DOG LINE omitted "What if ...?".
 *
 * It does NOT establish that the AI model actually produced the title card,
 * an audible first spoken phrase, or synchronized lips. Inspect the exported
 * first three seconds before publication.
 */
function validateCharacterIdeaHook({prompt,openingTitle,openingTitleSeconds=2.5}){
  if(typeof prompt!=='string'||!prompt.trim())throw new Error('What If: character IDEA prompt is empty');
  if(typeof openingTitle!=='string'||!/^what\\s+if\\b/i.test(openingTitle.trim()))throw new Error('What If: visible title must begin WHAT IF ...');
  if(!(openingTitleSeconds>=2&&openingTitleSeconds<=3))throw new Error('What If: title must remain on screen for 2–3 seconds');
  const first=/\\b([A-Za-z][A-Za-z0-9_-]{1,30})\\s+saying\\s*:\\s*["“']?([^]+?)(?=\\b[A-Za-z][A-Za-z0-9_-]{1,30}\\s+saying\\s*:|$)/i.exec(prompt);
  if(!first)throw new Error('What If: no explicit speaking character / dialogue found');
  const spoken=first[2].trim().replace(/^[\\s"'“”‘’]+/,'');
  if(!/^what\\s+if\\b/i.test(spoken)){
    throw new Error('What If: FIRST SPOKEN line by '+first[1]+' must begin "What if ...?"; got '+spoken.slice(0,110));
  }
  const intro=prompt.slice(0,first.index);
  if(!/\\b(?:on[- ]?screen|overlay|visible\\s+text|show\\s+text)\\b/i.test(intro)||
     !/what\\s+if\\b/i.test(intro)||
     !/(?:0\\s*:\\s*00|first\\s+frame|first\\s+second|from\\s+start)/i.test(intro)){
    throw new Error('What If: before dialogue, prompt must REQUIRE visual WHAT IF text starting at 0:00');
  }
  // The AI Tuber IDEA field is often limited to 800 characters. Do not silently
  // rewrite or truncate a valid dialogue to make room for the hook.
  if(prompt.length>800)throw new Error('What If: 3D character IDEA prompt exceeds 800 characters');
  return {ok:true,firstSpeaker:first[1],firstSpokenWords:spoken.slice(0,90),openingTitle};
}
function validateProducedWhatIfOpening({firstSceneText}){
  if(typeof firstSceneText!=='string'||!/^what\\s+if\\b/i.test(firstSceneText.trim())){
    throw new Error('What If: produced FIRST SCENE does not start audibly with What if; BLOCK PUBLICATION');
  }
  return true;
}

module.exports={validateOpeningHook,removeFirstSceneDirections,validateCharacterIdeaHook,validateProducedWhatIfOpening};
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
  const example='40s 3D dogs. At 0:00 ON-SCREEN text WHAT IF DOGS COULD TALK? for 2.5 seconds. First shot moving. Biscuit saying: What if dogs could talk? Pixel, humans throw the ball, then cheer when we bring it back! Pixel saying: We trained them!';
  validateCharacterIdeaHook({prompt:example,openingTitle:'WHAT IF DOGS COULD TALK?',openingTitleSeconds:2.5});
  validateProducedWhatIfOpening({firstSceneText:'What if dogs could talk?'});
  for(const bad of [
    example.replace('Biscuit saying: What if dogs could talk?','Biscuit saying: You know what I love about humans?'),
    example.replace('ON-SCREEN text WHAT IF DOGS COULD TALK?','no text'),
  ]){
    let blocked=false;try{validateCharacterIdeaHook({prompt:bad,openingTitle:'WHAT IF DOGS COULD TALK?',openingTitleSeconds:2.5})}catch{blocked=true}
    if(!blocked)throw new Error('Character hook guard failed to block bad IDEA prompt');
  }
  let blocked=false;try{validateProducedWhatIfOpening({firstSceneText:'You know what I love about humans?'})}catch{blocked=true}
  if(!blocked)throw new Error('Produced-scene guard failed to block published dog failure');
  console.log('Opening hook guard self-check passed, including character dialogue and produced scene checks');
}
