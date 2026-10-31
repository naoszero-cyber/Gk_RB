'use strict';
// Cyberpsycho hallucinations ("phantoms"): fake enemies that appear with each glitch burst (cgOn) and fade when the burst ends or the psycho state ends.
// They live in G.ph, not G.en, so they have no AI, score, kills, alerts or damage to the player. They look like real enemies plus glitch slices.
// Non-melee phantoms also fire cosmetic tracers (G.pht) at the player: they never hit or damage anything and stop at walls. Tune with PH.fire (cooldown range s), tspd, tlife, miss.
// They can be shot (the bullet is absorbed and the phantom dissolves), meleed, and they push the player like a body.
const PH={n:3,min:110,max:240,spd:55,stop:70,r:11,push:20,fire:[.3,.8],tspd:520,tlife:.45,miss:.14,fade:.3,types:['E','R','O','E','H']};
Object.assign(G,{
phSpawn(){const p=this.p;for(let n=0,pn=this.phN();n<pn;n++)for(let k=0;k<14;k++){const a=Math.random()*TAU,d=PH.min+Math.random()*(PH.max-PH.min),x=p.x+Math.cos(a)*d,y=p.y+Math.sin(a)*d;if(solid(x,y)||!los(p.x,p.y,x,y))continue;this.ph.push({x,y,a:0,t:0,ph:Math.random()*6,ty:PH.types[Math.random()*PH.types.length|0],fd:0,fc:PH.fire[0]+Math.random()*(PH.fire[1]-PH.fire[0]),fl:0});this.emit(x,y,8,'#00e5ff',90,.4,2);break}},
phKill(h){h.fd=PH.fade;this.emit(h.x,h.y,14,'#00e5ff',130,.5,2);this.emit(h.x,h.y,8,'#ff2bd6',110,.5,2);Snd.play('cy_burst_end')},
updPh(dt){const p=this.p;if(!this.ph)this.ph=[];
if(!this.pht)this.pht=[];
if(!p||!(p.cyp||(this.sy&&this.sy.ph>0))||this.state!=='play'){this.ph.length=0;this.pht.length=0;this.phOn=false;return}
for(let i=this.pht.length-1;i>=0;i--){const q=this.pht[i];q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.life<=0||solid(q.x,q.y))this.pht.splice(i,1)}
const on=!!this.cgOn;if(on&&!this.phOn)this.phSpawn();
if(!on&&this.phOn)for(const h of this.ph)if(!h.fd)h.fd=PH.fade;
this.phOn=on;
for(let i=this.ph.length-1;i>=0;i--){const h=this.ph[i];h.t+=dt;if(h.fd){h.fd-=dt;if(h.fd<=0){this.ph.splice(i,1);continue}continue}
const dx=p.x-h.x,dy=p.y-h.y,d=Math.hypot(dx,dy)||1;h.a=Math.atan2(dy,dx);if(h.fl>0)h.fl-=dt;
if(h.ty!=='R'&&(h.fc-=dt)<=0){h.fc=PH.fire[0]+Math.random()*(PH.fire[1]-PH.fire[0]);if(los(h.x,h.y,p.x,p.y)){const a=h.a+(Math.random()-.5)*2*PH.miss;this.pht.push({x:h.x+Math.cos(a)*16,y:h.y+Math.sin(a)*16,vx:Math.cos(a)*PH.tspd,vy:Math.sin(a)*PH.tspd,life:PH.tlife});h.fl=.06;Snd.play('ph_fire')}}
if(d>PH.stop){const nx=h.x+dx/d*PH.spd*dt,ny=h.y+dy/d*PH.spd*dt;if(!solid(nx,h.y))h.x=nx;if(!solid(h.x,ny))h.y=ny}
if(d<PH.push){const k=(PH.push-d)/d,px=p.x+dx*k,py=p.y+dy*k;if(!solid(px,p.y))p.x=px;if(!solid(p.x,py))p.y=py}}},
hitPh(b){if(!this.ph)return false;for(const h of this.ph)if(!h.fd&&Math.hypot(h.x-b.x,h.y-b.y)<(ET[h.ty].r||PH.r)){this.phKill(h);b.on=0;return true}return false},
meleePh(M){if(!this.ph)return;const p=this.p;for(const h of this.ph)if(!h.fd&&Math.hypot(h.x-p.x,h.y-p.y)<M.reach&&Math.abs(adiff(Math.atan2(h.y-p.y,h.x-p.x),p.a))<M.arc)this.phKill(h)},
drawPh(){if(this.pht&&this.pht.length){const c=this.cx;c.save();c.lineWidth=2;for(const q of this.pht){c.globalAlpha=Math.min(1,q.life/.15)*.8;c.strokeStyle='#00e5ff';c.beginPath();c.moveTo(q.x,q.y);c.lineTo(q.x-q.vx*.022,q.y-q.vy*.022);c.stroke()}c.restore()}
if(!this.ph||!this.ph.length)return;const c=this.cx,rm=Save.d.set.reduceMotion,rf=Save.d.set.reduceFlash,gk=Math.floor(this.t*18);
for(let i=0;i<this.ph.length;i++){const h=this.ph[i],T0=ET[h.ty],gl=h.ty==='M'?18:h.ty==='O'?14:h.ty==='R'?5:12,sc=h.ty==='H'?1.25:1;
const fl=rf?0:(cyR(gk*3+i)<.18?1:0),jx=rm?0:(cyR(gk+i*5)-.5)*(fl?8:2),al=(h.fd?h.fd/PH.fade:Math.min(1,h.t*4))*(rf?.7:.6+.25*cyR(gk*2+i));
c.save();c.globalAlpha=al;this.drawChar(h.x+jx,h.y,h.a,T0.col,h.ph+h.t*3,true,gl,0,false,T0.hair,sc);this.cySlices(h.x,h.y,h.a,gl,3,gk+i*3,h.ph,true);c.restore();if(h.fl>0&&!h.fd&&!rf)this.glow(h.x+Math.cos(h.a)*22,h.y+Math.sin(h.a)*22,22,'#00e5ff',.6)}},
});
