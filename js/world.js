'use strict';
// Interactive world: doors (E to toggle), destructible crates and explosive barrels.
Object.assign(G,{
nearDoor(x,y,r){let b=null,bd=r;for(const d of this.doors){const h=Math.hypot((d.x+.5)*T-x,(d.y+.5)*T-y);if(h<bd){bd=h;b=d}}return b},
doorAt(tx,ty){for(const d of this.doors)if(d.x===tx&&d.y===ty)return d;return null},
// A closed door blocks movement, bullets and sight. It cannot be shut while someone stands in the doorway.
toggleDoor(d,byPlayer){const cx=(d.x+.5)*T,cy=(d.y+.5)*T;
if(d.open){if(Math.hypot(this.p.x-cx,this.p.y-cy)<26)return false;for(const e of this.en)if(!e.dead&&Math.hypot(e.x-cx,e.y-cy)<26)return false;d.open=0;this.grid[d.y][d.x]=2}
else{d.open=1;this.grid[d.y][d.x]=0;if(byPlayer)this.noise(cx,cy,110)}
Snd.play('door');return true},
propAt(tx,ty){for(const q of this.props)if(q.hp>0&&q.x===tx&&q.y===ty)return q;return null},
hitProp(q,dmg){q.hp-=dmg;q.fl=.1;const x=(q.x+.5)*T,y=(q.y+.5)*T;
if(q.hp>0){this.emit(x,y,3,q.k==='c'?'#c8a15a':'#ff8844',90,.25,2);return}
if(q.k==='B'&&this.tsc()===0){q.pend=1;return}
this.grid[q.y][q.x]=0;
if(q.k==='c'){this.emit(x,y,14,'#a7793d',140,.5,2);Snd.play('crate');this.noise(x,y,160)}else this.boom(x,y)},
// Blast: damage falls off with distance and is stopped by walls; chains into nearby barrels and breaks crates.
boom(x,y){const p=this.p;Snd.play('boom');this.shake(12);{const pd=Math.hypot(p.x-x,p.y-y);if(pd<220)this.kickChroma(.55+.45*(1-pd/220))}this.noise(x,y,420);this.rings.push({x,y,t:.35,h:new Set()});
this.emit(x,y,28,'#ffb300',220,.6,3);this.emit(x,y,16,'#ff3b3b',160,.5,3);
},
// Expanding blast: damage is applied when the visible ring's edge reaches a target (each target once per ring), so it can be outrun in Sandevistan slow-mo.
blastWave(w){const R=96,p=this.p,x=w.x,y=w.y,rd=Math.min(R,96*(1-Math.max(w.t,0)/.35)+8);
for(const e of this.en)if(!e.dead&&!w.h.has(e)){const d=Math.hypot(e.x-x,e.y-y);if(d<R&&d<=rd&&lof(x,y,e.x,e.y)){w.h.add(e);this.hitE(e,Math.round(150*(1-d/R)+30),0,false)}}
if(p.hp>0&&!w.h.has(p)){const d=Math.hypot(p.x-x,p.y-y);if(d<R&&d<=rd&&lof(x,y,p.x,p.y)){w.h.add(p);if(p.inv<=0)this.hurt(Math.round(40*(1-d/R)+10))}}
for(const q of this.props){if(q.hp<=0||w.h.has(q))continue;const qx=(q.x+.5)*T,qy=(q.y+.5)*T,d=Math.hypot(qx-x,qy-y);
// Aim just outside the prop's own tile (23px short of its centre, past the corner): that tile is solid and would otherwise block the ray.
if(d<R&&d<=rd&&(d<4||lof(x,y,qx-(qx-x)/d*23,qy-(qy-y)/d*23))){w.h.add(q);this.hitProp(q,q.k==='B'?999:60)}}},
updWorld(dt){const p=this.p;if(p.hp>0)for(const q of this.intel)if(q.on&&Math.hypot(q.x-p.x,q.y-p.y)<20){q.on=0;this.intelGot++;Snd.play('pickup');this.pop(q.x,q.y-14,TL('INTEL')+' '+this.intelGot+'/'+this.intel.length+'  +'+INTEL_PTS,'#00e5ff')}
for(const d of this.doors)d.a+=((d.open?1:0)-d.a)*Math.min(1,dt*12);
const ks=this.tsc();for(const q of this.props)if(q.fl>0)q.fl-=dt*ks;
for(let i=this.rings.length-1;i>=0;i--){const w=this.rings[i];w.t-=dt*ks;if(ks>0)this.blastWave(w);if(w.t<=0)this.rings.splice(i,1)}},
});
