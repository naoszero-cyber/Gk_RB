'use strict';
// Safe localStorage wrapper: defaults, try/catch for blocked/full storage, save only at safe points.
// Rebindable actions (Esc = pause and the mouse buttons are fixed). KEYOK limits bindings to plain, unambiguous keys.
const KEYS0={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',melee:'Space',dodge:'ShiftLeft',reload:'KeyR',swap:'KeyQ',use:'KeyE',sand:'KeyF'};
const KEYOK=/^(Key[A-Z]|Digit[0-9]|Numpad[0-9]|Space|Shift(Left|Right)|Control(Left|Right)|Alt(Left|Right)|Arrow(Up|Down|Left|Right))$/;
const Save={k:'neonRequiem.v1',
d:{set:{master:.8,music:.5,sfx:.8,shake:true,reduceFlash:false,reduceMotion:false,chromaAmt:1,assist:true,light:2,part:1,opacity:.6,look:1,lock:false,mouseSens:1,aimSens:1,invert:false,dzMove:.15,dzAim:.2,lang:null},keys:{...KEYS0},best:{},unlock:1,stats:{kills:0,runs:0,intel:0}},
// Saved bindings are validated: unknown actions, bad key codes and duplicate keys fall back to the defaults.
cleanKeys(k){const r={...KEYS0};if(k&&typeof k==='object')for(const a in KEYS0)if(typeof k[a]==='string'&&KEYOK.test(k[a]))r[a]=k[a];return new Set(Object.values(r)).size===Object.keys(r).length?r:{...KEYS0}},
load(){let first=true;try{const o=JSON.parse(localStorage.getItem(this.k));if(o&&typeof o==='object'){first=false;this.d={...this.d,...o,set:{...this.d.set,...(o.set||{})},keys:this.cleanKeys(o.keys)}}
// Older saves stored lighting as on/off: on became Medium (the old look), off stays Off.
if(typeof this.d.set.light==='boolean')this.d.set.light=this.d.set.light?2:0}catch(e){}
// Language: a saved choice (0 English, 1 Thai) wins; otherwise follow the browser language (Thai if it starts with th).
if(this.d.set.lang!==0&&this.d.set.lang!==1){let bl='';try{bl=(navigator.languages&&navigator.languages[0])||navigator.language||''}catch(e){}this.d.set.lang=/^th\b/i.test(bl)?1:0}
// First run only: honour the system's reduced-motion preference. After that the player's own choice is saved and wins.
if(first)try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)this.d.set.reduceMotion=true}catch(e){}},
save(){try{localStorage.setItem(this.k,JSON.stringify(this.d))}catch(e){}},
reset(){try{localStorage.removeItem(this.k)}catch(e){}const s=this.d.set;this.d={set:s,keys:this.d.keys,best:{},unlock:1,stats:{kills:0,runs:0,intel:0}};this.save()}};
