'use strict';
const ROOM_HEAR=2;
Object.assign(G,{
// Gunshots (gun=true) are heard at ROOM_HEAR x the radius by enemies in the same room as the shooter. A room is an area enclosed by walls and doors (see roomMap in js/missions.js); door tiles belong to no room.
roomAt(x,y){const r=this.room&&this.room[y/T|0];return r&&r[x/T|0]||0},
noise(x,y,r,gun){if(this.p&&this.p.ts>0)return;const rm=gun?this.roomAt(x,y):0;for(const e of this.en)if(!e.dead&&(e.s==='patrol')){const rr=rm&&this.roomAt(e.x,e.y)===rm?r*ROOM_HEAR:r;if(Math.hypot(e.x-x,e.y-y)<rr){e.s='search';e.sx=x;e.sy=y;e.tm=3}}},
setChase(e){const p=this.p;e.s='chase';e.lx=p.x;e.ly=p.y;e.lost=0;e.aimt=0;
for(const o of this.en)if(!o.dead&&o!==e&&(o.s==='patrol'||o.s==='search')&&Math.hypot(o.x-e.x,o.y-e.y)<240){o.s='chase';o.lx=p.x;o.ly=p.y;o.lost=0;o.aimt=0}},
step(e,tx,ty,spd,dt,face){const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy),r=(ET[e.t].r||11)-3;e.bx=0;
if(d>2){this.openAhead(e,dx/d,dy/d,r);
const k=Math.min(spd*dt,d)/d;mv(e,dx*k,dy*k,r);if(face)e.a=lerpA(e.a,Math.atan2(dy,dx),dt*8)}
for(const o of this.en)if(o!==e&&!o.dead){const ox=e.x-o.x,oy=e.y-o.y,od=Math.hypot(ox,oy);if(od>0&&od<22)mv(e,ox/od*30*dt,oy/od*30*dt,r)}return d},
// Sideways strafe; flips direction (at most every 0.6s) when it hits something so enemies do not pin themselves against walls.
strafe(e,sp,dt,dx,dy){const sg=(Math.sin(e.ph*.3)>0?1:-1)*e.sf;this.step(e,e.x-dy*sg,e.y+dx*sg,sp,dt,false);e.sft-=dt;if(e.bx&&e.sft<=0){e.sf=-e.sf;e.sft=.6}},
// Enemy FSM: patrol -> alert (reaction delay) -> chase/attack -> search -> patrol; dead is terminal.
updEn(e,dt){if(e.dead){e.dt+=dt;return}const p=this.p,T0=ET[e.t],dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy),ang=Math.atan2(dy,dx);
e.cd-=dt;e.fl-=dt;e.sw-=dt;e.ph+=dt*4;
const see=p.hp>0&&d<T0.vis&&Math.abs(adiff(ang,e.a))<T0.fov&&los(e.x,e.y,p.x,p.y),near=p.hp>0&&d<45&&los(e.x,e.y,p.x,p.y),sees=!(p.sd>0)&&(see||near);
if(sees&&(e.s==='patrol'||e.s==='search')){e.s='alert';e.tm=T0.react;Snd.play('alert')}
switch(e.s){
case'alert':e.a=lerpA(e.a,ang,dt*10);e.tm-=dt;if(!sees){e.s='search';e.sx=p.x;e.sy=p.y;e.tm=3}else if(e.tm<=0)this.setChase(e);break;
case'chase':{if(T0.cover&&e.cph>0){this.eliteCover(e,dt);if(sees){e.lx=p.x;e.ly=p.y;e.lost=0}}else if(sees){e.lx=p.x;e.ly=p.y;e.lost=0;e.a=lerpA(e.a,ang,dt*8);
if(T0.melee)this.rush(e,dt,d);else if(T0.cover)this.elite(e,dt,d,ang,dx,dy);else if(!lof(e.x,e.y,p.x,p.y)){e.aimt=0;this.goTo(e,p.x,p.y,T0.spd,dt,false)}else{if(d>T0.keep+25)this.goTo(e,p.x,p.y,T0.spd,dt,false);else if(d<T0.keep-30){this.step(e,e.x-dx,e.y-dy,T0.spd,dt,false);if(e.bx)this.strafe(e,T0.spd*.7,dt,dx,dy)}else{this.strafe(e,T0.spd*.5,dt,dx,dy)}
if(d<T0.rng&&e.cd<=0){e.aimt+=dt;if(e.aimt>=T0.aim){e.aimt=0;e.cd=T0.cd*(.9+Math.random()*.4);this.spawnB(e.x+Math.cos(ang)*14,e.y+Math.sin(ang)*14,ang+(Math.random()-.5)*2*T0.acc,420,T0.dmg,1,700);Snd.play('efire');this.emit(e.x+Math.cos(ang)*16,e.y+Math.sin(ang)*16,2,'#ffd27a',100,.12,2)}}else if(e.cd>0)e.aimt=0}}
else{e.lost+=dt;e.aimt=0;const r=this.goTo(e,e.lx,e.ly,T0.spd,dt,true);if(r<10||e.gu||e.lost>6){e.s='search';e.sx=e.lx;e.sy=e.ly;e.tm=3}}break}
case'search':{const r=this.goTo(e,e.sx,e.sy,T0.spd*.7,dt,true);if(r<12||e.gu){e.a+=dt*1.6;e.tm-=dt;if(e.tm<=0){e.s='patrol';e.wt=.5;e.wx=e.hx;e.wy=e.hy}}break}
default:if(e.wt>0){e.wt-=dt;e.a+=Math.sin(this.t*.8+e.ph)*dt*.9;if(e.wt<=0)this.pickWp(e)}
else if(this.goTo(e,e.wx,e.wy,T0.spd*.45,dt,true)<8||e.gu){e.wt=1+Math.random()*1.5;e.gu=0}}},
// Rusher: closes in, winds up for e.aim seconds (telegraph), then strikes if the player is still in reach. Dodging the wind-up avoids the hit.
rush(e,dt,d){const T0=ET[e.t],p=this.p;
if(e.aimt>0){e.aimt+=dt;if(e.aimt>=T0.aim){e.aimt=0;e.cd=T0.cd;e.sw=.15;Snd.play('melee');if(d<T0.mrng+10&&los(e.x,e.y,p.x,p.y)){if(p.inv<=0)this.hurt(T0.mdmg);this.emit(p.x,p.y,6,'#e84393',110,.25,2)}}return}
if(d>T0.mrng-6)this.goTo(e,p.x,p.y,T0.spd,dt,false);
if(d<T0.mrng&&e.cd<=0)e.aimt=.001},
// Elite while exposed: keeps distance, strafes, fires a 3-shot burst, then looks for cover.
elite(e,dt,d,ang,dx,dy){const T0=ET[e.t],clr=lof(e.x,e.y,this.p.x,this.p.y);
if(!clr||d>T0.keep+25)this.goTo(e,this.p.x,this.p.y,T0.spd,dt,false);else if(d<T0.keep-30){this.step(e,e.x-dx,e.y-dy,T0.spd,dt,false);if(e.bx)this.strafe(e,T0.spd*.7,dt,dx,dy)}else this.strafe(e,T0.spd*.6,dt,dx,dy);
if(!clr)e.aimt=0;else if(d<T0.rng&&e.cd<=0){e.aimt+=dt;if(e.aimt>=T0.aim){e.aimt=0;e.cd=T0.cd;this.spawnB(e.x+Math.cos(ang)*14,e.y+Math.sin(ang)*14,ang+(Math.random()-.5)*2*T0.acc,420,T0.dmg,1,700);Snd.play('efire');this.emit(e.x+Math.cos(ang)*16,e.y+Math.sin(ang)*16,2,'#ffd27a',100,.12,2);
if(++e.cn>=3){e.cn=0;e.cd=T0.cd*2;if(this.findCover(e)){e.cph=1;e.ct=0}}}}else if(e.cd>0)e.aimt=0},
// Elite behind cover: phase 1 = run to the cover point, phase 2 = hold for a moment, then peek out again.
// Faces the last place the player was seen, not the player's real position, so it cannot track through walls.
eliteCover(e,dt){const T0=ET[e.t];e.a=lerpA(e.a,Math.atan2(e.ly-e.y,e.lx-e.x),dt*6);
if(e.cph===1){e.ct+=dt;const r=this.goTo(e,e.cx,e.cy,T0.spd*1.25,dt,false);if(r<8||e.gu||e.ct>2.5){e.cph=2;e.hide=.9+Math.random()*.8}}
else{e.hide-=dt;if(e.hide<=0)e.cph=0}},
// Cover = nearby floor point reachable in a straight line whose body-width rays to the player are blocked by walls or low furniture. Picks the closest.
findCover(e){const p=this.p;let best=0,bd=1e9;const pa=Math.atan2(p.y-e.y,p.x-e.x),ox=-Math.sin(pa)*9,oy=Math.cos(pa)*9;
for(let r=48;r<=120;r+=36)for(let i=0;i<16;i++){const a=i/16*TAU,x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r;
if(blocked(x,y,10)||!lof(e.x,e.y,x,y)||Math.hypot(p.x-x,p.y-y)<90)continue;
if(lof(x,y,p.x,p.y)||lof(x+ox,y+oy,p.x,p.y)||lof(x-ox,y-oy,p.x,p.y))continue;
if(r<bd){bd=r;best=1;e.cx=x;e.cy=y}}
return best},
pickWp(e){for(let i=0;i<6;i++){const a=Math.random()*TAU,r=40+Math.random()*90,x=e.hx+Math.cos(a)*r,y=e.hy+Math.sin(a)*r;if(!blocked(x,y,10)&&los(e.x,e.y,x,y)){e.wx=x;e.wy=y;return}}e.wx=e.hx;e.wy=e.hy},
});
