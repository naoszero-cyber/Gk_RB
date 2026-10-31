'use strict';
Save.load();G.init(document.getElementById('cv'));Input.init(G.cv);UI.init();
let last=performance.now();
// Delta time is clamped so tab switches never cause physics jumps.
function frame(t){requestAnimationFrame(frame);const dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;G.update(dt);G.render()}
requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.state==='play')UI.pause()});
