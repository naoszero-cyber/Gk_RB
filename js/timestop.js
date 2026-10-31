'use strict';
// DIO: THE WORLD (time stop). The knives volley lives in js/player.js (G.knives); projectiles that hang during the stop are in js/projectiles.js (HV).
// Time scale (G.tsc): 0 while time is stopped (enemies, bullets, particles, blast rings and every world animation freeze), SAND.slow in Sandevistan, otherwise 1.
// DIO himself always runs in real time. Enemies cannot detect him while time is stopped: their AI does not run, noise is ignored, and an enemy that is hit
// but survives only becomes alert when time resumes. An enemy killed during the stop stays standing (e.fk) until time resumes, like Sandevistan.
// The meter p.tm (0..TSC.max) drains in real time while stopped (but not during the activation effect, when DIO is also held still) and refills while time runs. F again cancels at once and keeps what is left.
// Smoothstep 0..1 between a and b (activation effect timing).
const tsSm=(a,b,x)=>{x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)};
// THE WORLD tunables (seconds). max = meter size and the longest single stop, regen = meter gained per second while time is running,
// min = meter needed to start a stop, fx = length of the activation effect.
const TSC={max:10,regen:.5,min:1,fx:1.5};
Object.assign(G,{
wt:0,tsOn:false,tsv:0,tsi:0,tst:0,tsax:0,tsay:0,
tsc(){const p=this.p;return!p?1:(p.ts>0&&this.state==='play')?0:p.sd>0?SAND.slow:1},
// Per-frame meter logic (player update, real dt).
updTs(dt){const p=this.p;if(!p.dio)return;if(p.ts>0){if(this.tsOn&&this.tsi<=0)p.tm-=dt;if(p.tm<=0){p.tm=0;p.ts=0}}else p.tm=Math.min(TSC.max,p.tm+dt*TSC.regen)},
// F pressed: cancel if stopped, otherwise start when the meter allows.
tsKey(){const p=this.p;if(p.ts>0)p.ts=0;else if(p.tm>=TSC.min)p.ts=1},
// Barrels destroyed while time was stopped (q.pend) explode as soon as time runs again.
tsBoom(){if(this.tsc()===0)return;for(const q of this.props)if(q.pend){q.pend=0;this.grid[q.y][q.x]=0;this.boom((q.x+.5)*T,(q.y+.5)*T)}},
// Edges and screen effect state (real dt). Start: flash + shockwave ring + sound. End: dead-but-standing enemies drop, enemies hit during the stop turn alert.
updTsFx(dt){const p=this.p,on=!!(p&&p.dio&&p.ts>0&&this.state==='play');
if(on&&!this.tsOn){this.tsi=TSC.fx;this.tst=0;this.tsax=p.x;this.tsay=p.y;Snd.play('ts_on')}
if(!on&&this.tsOn){this.tsi=0;Snd.play('ts_off');for(const e of this.en){e.fk=0;if(e.pd>0){const d=e.pd;e.pd=0;if(!e.dead)this.hurtE(e,d)}if(e.hts){e.hts=0;if(!e.dead&&(e.s==='patrol'||e.s==='search'))this.setChase(e)}}}
if(!on)this.tsBoom();
this.tsOn=on;if(this.tsi>0)this.tsi=Math.max(0,this.tsi-dt);if(on)this.tst+=dt;
this.tsv+=((on?1:0)-this.tsv)*Math.min(1,dt*(on?14:8));if(this.tsv<.01)this.tsv=0},
// The player (body, psycho slices, melee arc). Split out so DIO can be drawn after the time-stop grey-out and stay in colour.
drawPlayer(){const c=this.cx,p=this.p;
if(this.state!=='dead'||this.dead<.2){this.drawChar(p.x,p.y,p.a,p.inv>0&&p.dash<=0&&!Save.d.set.reduceFlash?'#fff':p.dio?'#e6c200':'#00bcd4',p.ph,Math.hypot(p.vx,p.vy)>20,WEAP[p.ws[p.wi].id].gl,p.fl,false,p.dio?'#ffe97a':'#111',1,true)}
if(this.cgOn&&this.state==='play')this.cySlices(p.x,p.y,p.a,WEAP[p.ws[p.wi].id].gl,3,Math.floor(this.t*18),p.ph,Math.hypot(p.vx,p.vy)>20,true);
if(p.mel>0){const M=WEAP[p.mid]||WEAP.fist;c.save();c.globalAlpha=Math.min(1,p.mel/M.sw*.9);c.strokeStyle=M.col;c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,M.reach*.65,p.a-M.arc+.1,p.a+M.arc-.1);c.stroke();c.restore()}},
// Time stop: colourless world (everything drawn so far). Called before DIO is redrawn on top.
// The grey-out is held back while the activation effect runs (tsGk) so the colour-inverted flicker is seen first, then the world drains to grey.
tsGk(){const k=Math.min(1,this.tsv);return this.tsi>0&&this.tsOn?k*tsSm(.55,.9,1-this.tsi/TSC.fx):k},
tsGray(){const c=this.cx,cv=this.cv,k=this.tsGk();c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='saturation';c.globalAlpha=k*.95;c.fillStyle='#808080';c.fillRect(0,0,cv.width,cv.height);
// Dim the greyed world (multiply) so it reads as dark and still; DIO is drawn again on top, so he stays bright.
c.globalCompositeOperation='multiply';c.globalAlpha=k;c.fillStyle='#7f86a4';c.fillRect(0,0,cv.width,cv.height);c.restore()},
// Soft glowing ring (screen space) around (x,y): radius r, half width wd.
tsRing(x,y,r,wd,a,rgb){if(a<=.01)return;const c=this.cx,w=this.cv.width,h=this.cv.height,r0=Math.max(0,r-wd),g=c.createRadialGradient(x,y,r0,x,y,r+wd);
g.addColorStop(0,'rgba('+rgb+',0)');g.addColorStop(.62,'rgba('+rgb+',.95)');g.addColorStop(.7,'rgba(255,255,255,1)');g.addColorStop(1,'rgba('+rgb+',0)');c.globalAlpha=a;c.fillStyle=g;c.fillRect(0,0,w,h);c.globalAlpha=1},
// Screen-space time-stop treatment, modelled on the anime "The World" cut. Activation (TSC.fx s, u = 0..1):
// 1) u<.12 white-gold burst on DIO with a first thin shockwave ring, 2) u .08-.7 the whole frame is a colour NEGATIVE that cycles blue -> pink -> violet -> green -> yellow
// while the picture is smeared and twisted outward from DIO (radial zoom + spiral), 3) u .62-1 a big glowing second ring sweeps out, a yellow-white sphere flashes on DIO and
// the world drains to dark blue-grey. Stopped: dark cool vignette, thin white energy ribbons and sparkles fixed in the world where the stop began.
// Reduce motion drops the smear/twist and holds the ribbons still; Reduce flashing replaces the negative flicker and flashes with one soft steady tint.
tsFx(){const c=this.cx,cv=this.cv,w=cv.width,h=cv.height,d=this.d,S=Save.d.set,p=this.p,k=this.tsGk(),rf=S.reduceFlash,rm=S.reduceMotion,sx=(p.x-this.cam.x)*this.s+w/2,sy=(p.y-this.cam.y)*this.s+h/2,R=Math.hypot(w,h),on=this.tsi>0,u=on?1-this.tsi/TSC.fx:1,ax=(this.tsax-this.cam.x)*this.s+w/2,ay=(this.tsay-this.cam.y)*this.s+h/2;c.save();
if(on&&!rm){const s=u<.85?Math.pow(Math.sin(Math.PI*u/.85),.8):0;
if(s>.02){if(!this.cs){this.cs=document.createElement('canvas');this.cc=document.createElement('canvas')}
const Sc=this.cs;if(Sc.width!==w||Sc.height!==h){Sc.width=this.cc.width=w;Sc.height=this.cc.height=h}
const q=Sc.getContext('2d');q.setTransform(1,0,0,1,0,0);q.drawImage(cv,0,0);const N=10;
for(let i=1;i<=N;i++){const f=i/N,z=1+s*.55*f;c.save();c.globalAlpha=.13*s+.035;c.translate(sx,sy);c.rotate(s*.11*f*(u<.5?1:-1));c.scale(z,z);c.drawImage(Sc,-sx,-sy);c.restore()}c.globalAlpha=1}}
if(on){
// Colour negative with a cycling tint.
if(!rf){const a0=.92*tsSm(.06,.1,u)*(1-tsSm(.5,.74,u));if(a0>.01){const cols=['#4a3cff','#ff3ca8','#8a5cff','#3cff8a','#ffe14a','#ffffff'],ci=Math.min(5,Math.floor((u-.06)/.64*6)),st=Math.floor(this.tst*30)%6===0?.45:1,a=a0*st;
c.globalCompositeOperation='difference';c.globalAlpha=a;c.fillStyle='#fff';c.fillRect(0,0,w,h);
c.globalCompositeOperation='color';c.globalAlpha=a*.6;c.fillStyle=cols[Math.max(0,ci)];c.fillRect(0,0,w,h);c.globalCompositeOperation='source-over';
// The scene is mostly dark, so a plain negative is flat: add speed lines out of DIO and dark corners to give it depth.
const ev=tsSm(.04,.1,u)*(1-tsSm(.5,.78,u)),rr=rm?0:u*1.4,vg=c.createRadialGradient(sx,sy,h*.25,sx,sy,R*.7);vg.addColorStop(0,'rgba(0,0,30,0)');vg.addColorStop(1,'rgba(0,0,30,'+.7*ev+')');c.globalAlpha=1;c.fillStyle=vg;c.fillRect(0,0,w,h);
c.fillStyle='rgba(255,255,255,'+.16*ev+')';for(let i=0;i<30;i++){const an=i*TAU/30+cyR(i*4.3)*.15+rr,wd=.012+.03*cyR(i*6.1+1),r0=h*(.1+.2*cyR(i*2.9));c.beginPath();c.moveTo(sx+Math.cos(an)*r0,sy+Math.sin(an)*r0);c.lineTo(sx+Math.cos(an-wd)*R,sy+Math.sin(an-wd)*R);c.lineTo(sx+Math.cos(an+wd)*R,sy+Math.sin(an+wd)*R);c.fill()}
c.globalAlpha=1}}
else if(u<.5){c.globalAlpha=.25*(1-u/.5);c.fillStyle='#6a5cff';c.fillRect(0,0,w,h);c.globalAlpha=1}
// Rings: a thin quick one right after the burst, then the big one that ends the activation.
const e1=Math.min(1,Math.max(0,(u-.03)/.3)),e2=Math.min(1,Math.max(0,(u-.6)/.4)),o1=1-Math.pow(1-e1,3),o2=1-Math.pow(1-e2,3),ra=rf?.4:1;
if(e1>0&&e1<1)this.tsRing(sx,sy,o1*R*.5+8*d,(10+14*(1-e1))*d,(1-e1)*.9*ra,'200,190,255');
if(e2>0&&e2<1)this.tsRing(sx,sy,o2*R*.85+12*d,(16+34*(1-e2))*d,Math.min(1,e2*6)*(1-e2)*1.1*ra,'255,235,150');
// Burst at the start and a yellow-white sphere flash as the world turns grey.
const fa=Math.max(1-tsSm(0,.14,u),Math.sin(Math.PI*Math.min(1,Math.max(0,(u-.78)/.2)))*.9)*(rf?.3:.9);
if(fa>.01){const sr=Math.max(1,(u<.3?R*(.1+.45*tsSm(0,.2,u)):R*(.08+.2*tsSm(.78,.95,u)))),sg=c.createRadialGradient(sx,sy,0,sx,sy,sr);sg.addColorStop(0,'rgba(255,252,225,1)');sg.addColorStop(.55,'rgba(255,238,150,.6)');sg.addColorStop(1,'rgba(255,215,90,0)');c.globalAlpha=fa;c.fillStyle=sg;c.fillRect(0,0,w,h);c.globalAlpha=1}}
if(k>0){
// Stopped world: cool dark vignette, white ribbons and sparkles. The ribbons and sparkles are fixed in the world where the stop began (they do not follow DIO) and do not animate.
const g=c.createRadialGradient(w/2,h/2,h*.2,w/2,h/2,h*.9);g.addColorStop(0,'rgba(20,24,70,0)');g.addColorStop(1,'rgba(8,10,40,'+.38*k+')');c.fillStyle=g;c.fillRect(0,0,w,h);
c.lineCap='round';
for(let i=0;i<9;i++){const ra=h*(.34+.42*cyR(i*2.3+1)),rb=ra*(.45+.4*cyR(i*3.9+2)),rot=cyR(i*5.1+3)*Math.PI,a0=i*TAU/9,len=.7+cyR(i*7.7+4)*1.1,n=14;
for(let j=0;j<n;j++){const sn=Math.sin(Math.PI*(j+.5)/n);c.strokeStyle='rgba(235,240,255,'+(.5*sn*k)+')';c.lineWidth=(.8+1.8*sn)*d;c.beginPath();c.ellipse(ax,ay,ra,rb,rot,a0+len*j/n,a0+len*(j+1)/n+.02);c.stroke()}}
for(let i=0;i<60;i++){const x=ax+(cyR(i*3.1+1)-.5)*1.8*w,y=ay+(cyR(i*5.7+2)-.5)*1.8*h,r=(2+cyR(i*7.3+3)*4)*d,tw=.75;
c.fillStyle='rgba(235,245,255,'+(.85*tw*k)+')';c.fillRect(x-r,y-d*.5,r*2,d);c.fillRect(x-d*.5,y-r,d,r*2);c.fillRect(x-d,y-d,d*2,d*2)}}
c.restore()},
});
