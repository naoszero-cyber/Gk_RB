'use strict';
// Player projectiles (knives, bullets, thrown weapons) fired while DIO has time stopped fly on in real time: they travel a short way (dist px) at full speed
// for the first `fast` part of it, then slow down smoothly until they hang motionless (below `min` px/s). They stay there until time runs again, then speed up
// over `ramp` seconds and fly on. hv: 0 normal, 1 flying/slowing, 3 hanging, 2 resuming.
const HV={dist:45,fast:.35,min:6,ramp:.1};
Object.assign(G,{
spawnB(x,y,a,spd,dmg,own,rng){for(const b of this.bl)if(!b.on){Object.assign(b,{sp:0,on:1,x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,dmg,own,th:0,life:rng/spd,ang:a,v0:spd,hv:0,hd:0,hr:0});if(own===0&&this.p&&this.p.dio&&this.tsc()===0)b.hv=1;return b}},
updB(b,dt){let ld=dt,sf=1;
if(b.hv){if(this.tsc()===0){if(b.hv===3)return;const f=Math.min(1,b.hd/HV.dist),u=Math.max(0,(f-HV.fast)/(1-HV.fast)),s=b.v0*(1-u)*(1-u);
if(s<HV.min){b.hv=3;b.vx=b.vy=0;return}b.hv=1;b.vx=Math.cos(b.ang)*s;b.vy=Math.sin(b.ang)*s;b.hd+=s*dt;ld=s*dt/b.v0;sf=s/b.v0}
else{if(b.hv!==2){b.hv=2;b.hr=0}b.hr+=dt;const k=Math.min(1,b.hr/HV.ramp);b.vx=Math.cos(b.ang)*b.v0*k;b.vy=Math.sin(b.ang)*b.v0*k;sf=k;if(k>=1)b.hv=0}}
b.life-=ld;b.sp+=dt*25*sf;if(b.life<=0){b.on=0;return}const p=this.p;
const n=Math.min(10,Math.max(2,Math.ceil(Math.hypot(b.vx,b.vy)*dt/8)));for(let k=0;k<n&&b.on;k++){b.x+=b.vx*dt/n;b.y+=b.vy*dt/n;
if(solid(b.x,b.y)){b.on=0;const gx=b.x/T|0,gy=b.y/T|0,q=this.grid[gy]&&this.grid[gy][gx]>=5?this.propAt(gx,gy):null;if(q)this.hitProp(q,b.dmg);else this.emit(b.x,b.y,4,'#ffd27a',90,.25,1.5);break}
if(b.own===0&&this.hitPh(b))break;
if(b.own===0){for(const e of this.en)if(!e.dead&&Math.hypot(e.x-b.x,e.y-b.y)<(ET[e.t].r||11)){this.hitE(e,b.dmg,0);this.hits++;b.on=0;break}}
else if(p.hp>0&&Math.hypot(p.x-b.x,p.y-b.y)<10){if(p.inv<=0)this.hurt(b.dmg);b.on=0}}},
});
