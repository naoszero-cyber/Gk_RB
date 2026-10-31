'use strict';
Object.assign(G,{
mkP(x,y){return{x,y,vx:0,vy:0,a:0,hp:100,ws:[{id:'pistol',mag:12,res:48}],wi:0,cd:0,rlt:0,mc:0,mel:0,dash:0,dvx:0,dvy:0,dcd:0,sd:0,pst:0,pcd:0,cys:0,cyx:0,cyy:0,cy:0,cyp:0,cyt:0,ts:0,tm:TSC.max,dio:0,inv:0,ph:0,fs:0,rec:0,fl:0,bx:0}},
updPlayer(dt){const p=this.p,I=Input,cb=p.cyp?this.cyBrain(dt):null,fz=p.dio&&p.ts>0&&this.tsi>0,m=fz?{x:0,y:0}:cb?cb.m:I.move(),W=WEAP[p.ws[p.wi].id],w=p.ws[p.wi];
p.cd-=dt;p.mc-=dt;p.mel-=dt;p.dcd-=dt;p.inv-=dt;p.fl-=dt;p.rec=Math.max(0,p.rec-dt*3);
if(fz){p.dash=0;p.vx=p.vy=0}
if(p.dash>0){p.dash-=dt;p.vx=p.dvx;p.vy=p.dvy}else{const sp=(I.alt&&!p.cyp?100:150)*(p.sd>0?SAND.haste:1),k=Math.min(1,dt*12);p.vx+=(m.x*sp-p.vx)*k;p.vy+=(m.y*sp-p.vy)*k}
p.bx=0;mv(p,p.vx*dt,p.vy*dt,9);
const spd=Math.hypot(p.vx,p.vy);p.ph+=spd*dt*.09;if(spd>60){p.fs-=dt;if(p.fs<=0){p.fs=.32;Snd.play('step')}}
// aim: touch stick (with optional assist) or mouse in world space (recomputed each frame so camera motion stays accurate)
const av=I.aim();let fire=I.md||I.fbtn;
if(av){let a=Math.atan2(av.y,av.x);if(Save.d.set.assist){let best=.35;for(const e of this.en)if(!e.dead){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<350&&los(p.x,p.y,e.x,e.y)){const df=Math.abs(adiff(Math.atan2(e.y-p.y,e.x-p.x),a));if(df<best){best=df;p.aimT=Math.atan2(e.y-p.y,e.x-p.x)}}}if(best<.35)a=p.aimT}const as=Save.d.set.aimSens;p.a=as>=.99?a:lerpA(p.a,a,1-Math.exp(-dt*(4+as*30)));if(av.l>.5)fire=true}
else if(!I.touch){const wx=(I.mx-this.cv.width/2)/this.s+this.cam.x,wy=(I.my-this.cv.height/2)/this.s+this.cam.y;p.a=Math.atan2(wy-p.y,wx-p.x)}
if(cb){p.a=cb.a;fire=cb.fire}
if(fz)fire=false;
if(I.hit('dodge')&&p.dcd<=0&&!fz){let dx=m.x,dy=m.y;if(!dx&&!dy){dx=Math.cos(p.a);dy=Math.sin(p.a)}const l=Math.hypot(dx,dy);p.dvx=dx/l*380;p.dvy=dy/l*380;p.dash=.18;p.inv=.3;p.dcd=.9;Snd.play('dash');this.emit(p.x,p.y,8,'#556',60,.4,2)}
if(I.hit('sand')){if(p.dio)this.tsKey();else if(!p.cyp)p.sd=p.sd>0?0:1}
this.updCyber(dt);this.updTs(dt);
if(I.hit('swap')&&p.ws.length>1){p.wi=(p.wi+1)%p.ws.length;p.rlt=0;Snd.play('ui')}
// Use key: pick up the nearest weapon in reach, otherwise toggle a door.
if(I.hit('use')){const pk=this.nearPk();if(pk)this.takePk(pk);else{const dr=this.nearDoor(p.x,p.y,46);if(dr)this.toggleDoor(dr,true)}}
if(I.hit('melee')&&p.mc<=0&&!fz){const M=W.melee?W:WEAP.fist;p.mid=W.melee?w.id:'fist';p.mc=M.cd;p.mel=M.sw;Snd.play('melee');this.noise(p.x,p.y,M.nz);for(const e of this.en)if(!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<M.reach&&Math.abs(adiff(Math.atan2(e.y-p.y,e.x-p.x),p.a))<M.arc)this.hitE(e,M.dmg,p.a,true);this.meleePh(M);for(const q of this.props)if(q.hp>0&&Math.hypot((q.x+.5)*T-p.x,(q.y+.5)*T-p.y)<M.reach+14&&Math.abs(adiff(Math.atan2((q.y+.5)*T-p.y,(q.x+.5)*T-p.x),p.a))<M.arc+.3)this.hitProp(q,M.dmg)}
if((I.hit('reload')||(fire&&w.mag===0))&&p.rlt<=0&&w.mag<W.mag&&w.res>0){p.rlt=W.rl;Snd.play('reload')}
if(p.rlt>0){p.rlt-=dt;if(p.rlt<=0){const n=Math.min(W.mag-w.mag,w.res);w.mag+=n;w.res-=n}}
if(W.kn){if(fire&&p.cd<=0)this.knives(W,av)}
else if(fire&&p.rlt<=0&&p.cd<=0&&w.mag>0){w.mag--;p.cd=W.rate;this.shots+=W.pel;const spr=W.sp*(1+p.rec)*(I.alt&&!p.cyp?.4:1);
for(let i=0;i<W.pel;i++)this.spawnB(p.x+Math.cos(p.a)*18,p.y+Math.sin(p.a)*18,p.a+(Math.random()-.5)*2*spr,W.spd,W.dmg,0,W.rng);
p.rec=Math.min(.8,p.rec+(W.rc||(W.rate<.1?.06:.3)));p.fl=.06;this.emit(p.x+Math.cos(p.a)*20,p.y+Math.sin(p.a)*20,3,'#ffd27a',140,.15,2);
const sa=p.a+1.6;this.emit(p.x+Math.cos(p.a)*8,p.y+Math.sin(p.a)*8,1,'#d4a017',80,.5,2,sa,.6);Snd.play(W.snd);this.shake(W.pel>1?4:1.5);this.noise(p.x,p.y,320,true)}
// Melee weapon in hand: left click / FIRE button throws it (the aim stick never throws, to avoid accidents).
if(W.melee&&(I.md||I.fbtn)&&p.cd<=0&&!fz)this.throwW();
if(this.ex&&this.en.every(e=>e.dead)&&Math.hypot(this.ex.x-p.x,this.ex.y-p.y)<22)this.complete()},
// DIO: starting kit (Knives in slot 1, pistol in slot 2; Q swaps).
dioInit(p){p.dio=1;p.ws=[{id:'knives',mag:0,res:0},{id:'pistol',mag:12,res:48}];p.wi=0},
// Knives: one volley = 3 knives in an inverted umbrella cone. They leave the muzzle spread out sideways (spr px apart) and each aims at the same focus point
// (the mouse point; with touch aiming the nearest living enemy within ta rad of the aim direction, tr px and in line of sight, otherwise fd px ahead), so the three paths close up into a point. Unlimited ammo. While time is stopped they hang in the air (see HV).
knives(W,av){const p=this.p,I=Input,ca=Math.cos(p.a),sa=Math.sin(p.a);let fx,fy;
if(av||I.touch||p.cyp){fx=p.x+ca*W.fd;fy=p.y+sa*W.fd;let bd=W.tr;for(const e of this.en)if(!e.dead){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<bd&&Math.abs(adiff(Math.atan2(e.y-p.y,e.x-p.x),p.a))<W.ta&&los(p.x,p.y,e.x,e.y)){bd=d;fx=e.x;fy=e.y}}}else{fx=(I.mx-this.cv.width/2)/this.s+this.cam.x;fy=(I.my-this.cv.height/2)/this.s+this.cam.y}
const fd=(fx-p.x)*ca+(fy-p.y)*sa;if(fd<W.fmin){fx+=ca*(W.fmin-fd);fy+=sa*(W.fmin-fd)}
p.cd=W.rate;let n=0;
for(let i=-1;i<=1;i++){let sx=p.x+ca*20-sa*i*W.spr,sy=p.y+sa*20+ca*i*W.spr;if(i&&(solid(sx,sy)||!los(p.x,p.y,sx,sy))){sx=p.x+ca*20;sy=p.y+sa*20}
const a=Math.atan2(fy-sy,fx-sx),b=this.spawnB(sx,sy,a,W.spd,W.dmg,0,Math.max(W.rng,Math.hypot(fx-sx,fy-sy)+160));if(b){b.th='knife';n++}}
if(n){this.shots+=n;Snd.play('throw');this.noise(p.x,p.y,W.nz)}},
// Warning stages (see CYS): stage = number of gauge levels reached while not yet psycho. Runs a burst on/off machine; a new stage starts a burst at once. The renderer turns G.syOn into the ghosts/glitch (cgOn).
updSym(dt){const p=this.p,S=this.sy||(this.sy={st:0,on:false,t:0,gn:0,gi:0,ph:0});let st=0;if(!p.cyp&&this.state==='play')for(const a of CYS.at)if(p.cy>=a)st++;
const pv=S.st;S.st=st;if(!st){S.on=false;S.t=0;S.gn=S.gi=S.ph=0;this.syOn=false;return}
const i=st-1,rnd=()=>.75+Math.random()*.5;S.gn=CYS.ghosts[i];S.gi=CYS.glitch[i];S.ph=CYS.phantoms[i];
if(st>pv){S.on=true;S.t=CYS.on[i]*rnd();this.shake(CYS.shake[i])}
else{S.t-=dt;if(S.t<=0){S.on=!S.on;S.t=(S.on?CYS.on[i]:CYS.off[i])*rnd();if(S.on)this.shake(CYS.shake[i])}}
this.syOn=S.on;if(S.on&&p.hp>CY.floor*100){p.hp=Math.max(CY.floor*100,p.hp-CYS.bleed[i]*dt);this.hurtT=Math.max(this.hurtT,.2)}},
cgN(){return this.p.cyp?CYG.n:(this.sy?this.sy.gn:0)},
phN(){return this.p.cyp?PH.n:(this.sy?this.sy.ph:0)},
// Cyberpsycho gauge: fills while Sandevistan is on, drains while it is off. Full = forced off + psycho until empty (bleeding only while the ghosts are visible).
updCyber(dt){const p=this.p;
if(p.cyp){if(p.sd>0){p.pst-=dt;if(p.pst<=0){p.sd=0;p.pcd=2}}else if(p.pcd>0)p.pcd=Math.max(0,p.pcd-dt);if(p.sd<=0&&p.pcd<=0&&p.cyal){p.sd=1;p.pst=2}}
if(p.cyp&&p.sd>0){}else if(p.sd>0)p.cy=Math.min(1,p.cy+dt/CY.fill);else p.cy=Math.max(0,p.cy-dt/CY.drain);
if(p.cy>=1&&!p.cyp){p.cyp=1;p.sd=0;p.pcd=2;p.cyt=0;Snd.play('hurt');Snd.play('cy_start');this.shake(8);this.kickChroma(1)}
this.updSym(dt);
if(p.cyp){if(this.cgOn){const fl=CY.floor*100;if(p.hp>fl){p.hp=Math.max(fl,p.hp-CY.bleed*dt);this.hurtT=Math.max(this.hurtT,.25)}}
if(p.hp<=0){p.hp=0;this.state='dead';this.dead=0;this.ovShown=0;Snd.play('fail');return}
if(p.cy<=0){p.cyp=0;p.pcd=0;p.pst=0;Snd.play('cy_end')}}},
// Psycho "brain": the player has no control. Chases the nearest living enemy (A* around walls, opens doors), staggers, shoots when it has a line of fire and swings when close.
cyBrain(dt){const p=this.p,I=Input,K=Save.d.keys;
for(const a of['dodge','swap','use','melee','reload','sand'])delete I.once[K[a]];delete I.once.ShiftRight;
p.cyt+=dt;let t=null,bd=1e9;for(const e of this.en)if(!e.dead){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<bd){bd=d;t=e}}
const th=this.cyThreat(p),ns=new Set();let pv=null;
for(const b of th.concat(this.cyThreatPh(p))){ns.add(b);if(!(p.cyset&&p.cyset.has(b))&&Math.random()<CYA.chance)pv=b}
p.cyset=ns;p.cyal=th.length>0||bd<CYA.near;if(this.ph)for(const h of this.ph)if(!h.fd){const d=Math.hypot(h.x-p.x,h.y-p.y);if(d<bd){bd=d;t=h}}let ov=null;
if(pv){const sp=Math.hypot(pv.vx,pv.vy),rx=p.x-pv.x,ry=p.y-pv.y;let qx=-pv.vy/sp,qy=pv.vx/sp;if(qx*rx+qy*ry<0){qx=-qx;qy=-qy}
if(p.dcd<=0){I.once[K.dodge]=1;ov={x:qx,y:qy}}else{p.cys=CYA.step;p.cyx=qx;p.cyy=qy}}
const bf=this.cyBlast(p);if(bf&&bf.dash&&p.dcd<=0)I.once[K.dodge]=1;
if(!t)return{m:bf?{x:bf.x,y:bf.y}:{x:0,y:0},a:p.a,fire:false};
const seen=los(p.x,p.y,t.x,t.y),ang=Math.atan2(t.y-p.y,t.x-p.x);let gx=t.x,gy=t.y;
if(!clearLine(p.x,p.y,t.x,t.y,6)){p.cpt=(p.cpt||0)-dt;if(!p.cpath||p.cpt<=0||p.cpi>=p.cpath.length){p.cpath=this.findPath(p.x,p.y,t.x,t.y,6)||[];p.cpi=0;p.cpt=.35}
while(p.cpi<p.cpath.length-1&&Math.hypot(p.cpath[p.cpi].x-p.x,p.cpath[p.cpi].y-p.y)<10)p.cpi++;
if(p.cpath.length){gx=p.cpath[p.cpi].x;gy=p.cpath[p.cpi].y}}
let da=Math.atan2(gy-p.y,gx-p.x)+Math.sin(p.cyt*7)*.45;
const stop=bd<26;let mx=stop?0:Math.cos(da),my=stop?0:Math.sin(da);
if(!stop)this.openAhead(p,mx,my,9);
if(bd<42&&p.mc<=0)I.once[K.melee]=1;
if(p.cys>0){p.cys-=dt;mx=mx*.5+p.cyx;my=my*.5+p.cyy}
if(ov){mx=ov.x;my=ov.y}
if(bf){mx=bf.x;my=bf.y}
const ml=Math.hypot(mx,my);if(ml>1){mx/=ml;my/=ml}
return{m:{x:mx,y:my},a:ang+Math.sin(p.cyt*11)*.25,fire:seen&&bd<420}},
// Explosion dodge: while a barrel blast that can still hit the player is within CYA.blast px of its centre (walls that block the blast count as safe), run away from the centre along the best of 7 headings
// (away from the blast, open ground, and cover behind a wall preferred) and dash too when closer than CYA.bdash (the dash also gives 0.3 s of invulnerability). Beats the bullet dodge and the chase.
cyBlast(p){let w=null,wd=1e9;for(const r of this.rings){if(r.t<=0||r.h.has(p))continue;const d=Math.hypot(p.x-r.x,p.y-r.y);if(d<CYA.blast&&d<wd&&lof(r.x,r.y,p.x,p.y)){w=r;wd=d}}
if(!w)return null;const base=wd<1?p.a+Math.PI:Math.atan2(p.y-w.y,p.x-w.x);let best=null,bs=-1e9;
for(const o of[0,.5,-.5,1,-1,1.6,-1.6]){const a=base+o,dx=Math.cos(a),dy=Math.sin(a),ex=p.x+dx*40,ey=p.y+dy*40;let s=Math.cos(o)*2;if(!clearLine(p.x,p.y,ex,ey,9))s-=3;else if(!lof(w.x,w.y,ex,ey))s+=1;if(s>bs){bs=s;best={x:dx,y:dy}}}
best.dash=wd<CYA.bdash;return best},
// Enemy bullets heading for the player: ahead within CYA.look px and passing within CYA.lane px of the player.
cyThreat(p){const r=[];for(const b of this.bl){if(!b.on||b.own===0)continue;const rx=p.x-b.x,ry=p.y-b.y,sp=Math.hypot(b.vx,b.vy);if(!sp)continue;const al=(rx*b.vx+ry*b.vy)/sp;if(al<=0||al>CYA.look)continue;if(Math.abs(rx*b.vy-ry*b.vx)/sp<CYA.lane)r.push(b)}return r},
// Cosmetic phantom tracers (G.pht) heading for the player: the psycho brain dodges them like real bullets, but they never count for the Sandevistan alert.
cyThreatPh(p){const r=[];if(!this.pht)return r;for(const b of this.pht){const rx=p.x-b.x,ry=p.y-b.y,sp=Math.hypot(b.vx,b.vy);if(!sp)continue;const al=(rx*b.vx+ry*b.vy)/sp;if(al<=0||al>CYA.look)continue;if(Math.abs(rx*b.vy-ry*b.vx)/sp<CYA.lane)r.push(b)}return r},
// Weapons on the floor are taken with the Use key (28px reach). A melee weapon you already carry cannot be taken twice.
canTake(k){return k.on&&!(WEAP[k.id].melee&&this.p.ws.some(q=>q.id===k.id))},
nearPk(){const p=this.p;let b=null,bd=28;for(const k of this.pk)if(this.canTake(k)){const d=Math.hypot(k.x-p.x,k.y-p.y);if(d<bd){bd=d;b=k}}return b},
takePk(k){const p=this.p;k.on=0;const ex=p.ws.find(q=>q.id===k.id);if(ex)ex.res+=WEAP[k.id].mag*2;else{p.ws.push({id:k.id,mag:WEAP[k.id].mag,res:WEAP[k.id].res});if(!WEAP[k.id].melee){p.wi=p.ws.length-1;p.rlt=0}}Snd.play('pickup');this.pop(k.x,k.y,WEAP[k.id].n,'#ffb300')},
// Throw the equipped melee weapon as a spinning projectile; it is consumed.
throwW(){const p=this.p,w=p.ws[p.wi],W=WEAP[w.id],b=this.spawnB(p.x+Math.cos(p.a)*18,p.y+Math.sin(p.a)*18,p.a,W.ths,W.thd,0,W.thr);if(!b)return;b.th=w.id;p.ws.splice(p.wi,1);p.wi=Math.max(0,p.wi-1);p.rlt=0;p.cd=.25;this.shots++;Snd.play('throw');this.noise(p.x,p.y,100);this.shake(1)},
hurt(d){const p=this.p;p.hp-=d;this.dmgT+=d;p.inv=.15;this.hurtT=.7;this.shake(6);this.kickChroma(.8);this.emit(p.x,p.y,10,'#c0392b',120,.4,2);Snd.play('hurt');this.combo=0;this.mult=1;
if(p.hp<=0){p.hp=0;this.state='dead';this.dead=0;this.ovShown=0;Snd.play('fail')}},
});
