'use strict';
Object.assign(G,{
shake(v){if(Save.d.set.shake&&!Save.d.set.reduceMotion)this.sh=Math.max(this.sh,v)},
// Chromatic aberration strength 0..1 (damage, nearby blast). Decays quickly; ignored while Reduce motion is on.
chroma:0,
hv:0,hurtT:0,
kickChroma(v){if(!Save.d.set.reduceMotion&&Save.d.set.chromaAmt>0)this.chroma=Math.max(this.chroma,v)},
updCam(dt,st){const p=this.p;let lx=0,ly=0;if(st==='play'){const la=Save.d.set.reduceMotion?0:50*Save.d.set.look;lx=Math.cos(p.a)*la;ly=Math.sin(p.a)*la}
const k=1-Math.exp(-dt*7);this.cam.x+=(p.x+lx-this.cam.x)*k;this.cam.y+=(p.y+ly-this.cam.y)*k;this.sh*=Math.exp(-dt*9);this.chroma*=Math.exp(-dt*7);if(this.chroma<.02)this.chroma=0;
// Steady damage cue for Reduce flashing: smooth red screen edge after a hit, and a constant faint one at low health. No blinking.
this.hurtT=Math.max(0,this.hurtT-dt);{const tg=(this.hurtT>0?.3:0)+(p.hp>0&&p.hp<=35?.18:0);this.hv+=(tg-this.hv)*Math.min(1,dt*8)}},
});
