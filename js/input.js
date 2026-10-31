'use strict';
// Unified keyboard / mouse / Pointer-Event touch input. Two virtual sticks, multi-touch safe.
// Short on-screen name for a key code.
const keyName=c=>({Space:'SPACE',ShiftLeft:'L-SHIFT',ShiftRight:'R-SHIFT',ControlLeft:'L-CTRL',ControlRight:'R-CTRL',AltLeft:'L-ALT',AltRight:'R-ALT',ArrowUp:'UP',ArrowDown:'DOWN',ArrowLeft:'LEFT',ArrowRight:'RIGHT'}[c]||c.replace(/^(Key|Digit|Numpad)/,m=>m==='Numpad'?'NUM ':'').toUpperCase());
const Input={k:{},once:{},mx:0,my:0,md:false,alt:false,fbtn:false,touch:false,lock:false,st:{l:null,r:null},R:60,
init(cv){
addEventListener('keydown',e=>{if(G.state==='play'&&(e.code==='ShiftRight'||Object.values(Save.d.keys).includes(e.code)))e.preventDefault();if(!e.repeat)this.once[e.code]=1;this.k[e.code]=1});
addEventListener('keyup',e=>{this.k[e.code]=0});addEventListener('blur',()=>this.reset());
cv.addEventListener('contextmenu',e=>e.preventDefault());
const side=e=>e.clientX<innerWidth/2?'l':'r';
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);if(e.pointerType==='mouse'){this.touch=false;if(Save.d.set.lock&&G.state==='play'&&document.pointerLockElement!==cv&&cv.requestPointerLock)cv.requestPointerLock();if(e.button===0)this.md=true;if(e.button===2)this.alt=true;this.pm(e)}else{this.touch=true;const s=side(e);if(!this.st[s])this.st[s]={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY}}});
cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')this.pm(e);else for(const s of['l','r']){const t=this.st[s];if(t&&t.id===e.pointerId){t.x=e.clientX;t.y=e.clientY}}});
const up=e=>{if(e.pointerType==='mouse'){if(e.button===0)this.md=false;if(e.button===2)this.alt=false}else for(const s of['l','r']){const t=this.st[s];if(t&&t.id===e.pointerId)this.st[s]=null}};
// Optional relative mouse mode: a virtual cursor moves by the mouse delta (scaled by Mouse sensitivity). Losing the lock (Esc) pauses.
document.addEventListener('pointerlockchange',()=>{this.lock=document.pointerLockElement===cv;if(!this.lock&&G.state==='play'&&Save.d.set.lock)UI.pause()});
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
// Touch buttons press the action's current key, so they keep working after a rebind.
document.querySelectorAll('#tc [data-act]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();this.once[Save.d.keys[b.dataset.act]]=1}));
const fb=document.getElementById('fb');fb.addEventListener('pointerdown',e=>{fb.setPointerCapture(e.pointerId);this.fbtn=true});
fb.addEventListener('pointerup',()=>this.fbtn=false);fb.addEventListener('pointercancel',()=>this.fbtn=false)},
pm(e){const d=G.d;if(this.lock){const k=Save.d.set.mouseSens*d;this.mx=Math.max(0,Math.min(G.cv.width,this.mx+(e.movementX||0)*k));this.my=Math.max(0,Math.min(G.cv.height,this.my+(e.movementY||0)*k));return}this.mx=e.clientX*d;this.my=e.clientY*d},
// Action helpers: hit = pressed this frame, held = currently down. R-Shift also dodges while dodge is on its default key.
// Clears every held key / button / touch stick (pause, window blur).
reset(){this.k={};this.once={};this.md=false;this.alt=false;this.fbtn=false;this.st={l:null,r:null}},
hit(a){const c=Save.d.keys[a];return !!(this.once[c]||(c==='ShiftLeft'&&this.once.ShiftRight))},
held(a){return !!this.k[Save.d.keys[a]]},
useLabel(){return this.touch?TL('USE'):keyName(Save.d.keys.use)},
vec(s){const t=this.st[s];if(!t)return null;let x=(t.x-t.x0)/this.R,y=(t.y-t.y0)/this.R;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}return{x,y,l:Math.min(l,1)}},
move(){let x=(this.held('right')?1:0)-(this.held('left')?1:0),y=(this.held('down')?1:0)-(this.held('up')?1:0);const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}const v=this.vec('l');if(v&&v.l>Save.d.set.dzMove){x=v.x;y=v.y}return{x,y}},
aim(){const v=this.vec('r');if(!v||v.l<=Save.d.set.dzAim)return null;if(Save.d.set.invert)v.y=-v.y;return v}};
