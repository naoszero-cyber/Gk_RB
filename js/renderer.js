'use strict';
const SAND_STOPS=[[0,63,242,230],[.25,74,123,255],[.5,155,92,255],[.75,184,212,58],[1,138,58,74]];
function cyR(n){const x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)}
function cyPhase(t){let e=CYG.on0,i=0;while(t>=e&&i<2000){i++;e+=i%2?CYG.offMin+cyR(i*31.7)*(CYG.offMax-CYG.offMin):CYG.onMin+cyR(i*31.7)*(CYG.onMax-CYG.onMin)}return{on:i%2===0,seg:i}}
function sandCol(u){for(let i=1;i<SAND_STOPS.length;i++){const a=SAND_STOPS[i-1],b=SAND_STOPS[i];if(u<=b[0]){const f=(u-a[0])/(b[0]-a[0]);return[a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f,a[3]+(b[3]-a[3])*f].map(Math.round)}}return SAND_STOPS[4].slice(1)}
Object.assign(G,{
resize(){this.d=Math.min(devicePixelRatio||1,2);this.cv.width=innerWidth*this.d;this.cv.height=innerHeight*this.d;this.cv.style.width=innerWidth+'px';this.cv.style.height=innerHeight+'px';this.s=Math.min(this.cv.height/520,this.cv.width/640)},
// Static world is rendered once into an offscreen canvas.
buildCache(){const c=document.createElement('canvas');c.width=this.mw*T;c.height=this.mh*T;const x=c.getContext('2d');
for(let y=0;y<this.mh;y++)for(let i=0;i<this.mw;i++){const px=i*T,py=y*T;
const v=this.grid[y][i];if(v===1){const below=y+1<this.mh&&this.grid[y+1][i]!==1;x.fillStyle='#1d1d33';x.fillRect(px,py,T,T);x.fillStyle='#2a2a4a';x.fillRect(px,py,T,T-(below?10:0));
if(below){x.fillStyle='#0c0c18';x.fillRect(px,py+T-10,T,10);x.fillStyle=(i+y)%3?'#00e5ff':'#ff2bd6';x.fillRect(px,py+T-10,T,2)}}
else{x.fillStyle=(i+y)%2?'#12121e':'#161625';x.fillRect(px,py,T,T);x.strokeStyle='#0a0a14';x.strokeRect(px+.5,py+.5,T-1,T-1);
x.fillStyle='rgba(255,255,255,.03)';for(let k=0;k<4;k++)x.fillRect(px+Math.random()*28,py+Math.random()*28,2,2);if(v===3||v===4)this.furn(x,v,px,py,(i+y)%3)}}
if(this.ex){x.fillStyle='#0f3';x.globalAlpha=.35;x.fillRect(this.ex.x-14,this.ex.y-14,28,28);x.globalAlpha=1;x.strokeStyle='#0f3';x.strokeRect(this.ex.x-14,this.ex.y-14,28,28)}
this.cache=c},
// ---------- rendering ----------
// Glitch slices: horizontal strips of the character shifted sideways (cyan / magenta / own colour) plus thin bars. Used on the psycho body and its ghosts.
cySlices(x,y,a,gl,n,k,ph,mv,bars){const c=this.cx,cols=['#00bcd4','#ff2bd6','#00e5ff'];for(let j=0;j<n;j++){const r=k*5+j*11,y0=(cyR(r)-.5)*30,h=2+cyR(r+1)*4,dx=(cyR(r+2)<.5?-1:1)*(4+cyR(r+3)*6);c.save();c.beginPath();c.rect(x-30,y+y0,60,h);c.clip();c.translate(dx,0);this.drawChar(x,y,a,cols[(j+k)%3],ph,mv,gl,0,false,'#111',1);c.restore()}
if(bars&&!Save.d.set.reduceFlash){c.save();for(let j=0;j<2;j++){const r=k*7+j*17;c.globalAlpha=.8;c.fillStyle=cols[(j+k+1)%3];c.fillRect(x-14+cyR(r)*10,y+(cyR(r+1)-.5)*28,10+cyR(r+2)*16,1+cyR(r+3)*1.5)}c.restore()}},
render(){const c=this.cx,cv=this.cv,s=this.s;c.setTransform(1,0,0,1,0,0);c.fillStyle='#05050a';c.fillRect(0,0,cv.width,cv.height);if(!this.cache)return;
const k=Save.d.set.reduceMotion?0:this.sh,ox=(Math.random()-.5)*k*2,oy=(Math.random()-.5)*k*2;
c.setTransform(s,0,0,s,cv.width/2-this.cam.x*s+ox*s,cv.height/2-this.cam.y*s+oy*s);
c.drawImage(this.cache,0,0);
for(const e of this.en)if(e.dead&&!e.fk)this.drawChar(e.x,e.y,e.a,ET[e.t].col,0,false,WEAP.pistol.gl,0,true);
this.drawWorld();
for(const q of this.pk)if(q.on){const M=WEAP[q.id];if(M.melee){c.save();c.strokeStyle=M.col;c.shadowColor=M.col;c.shadowBlur=8;c.lineWidth=3;c.beginPath();c.moveTo(q.x-M.gl*.7,q.y+M.gl*.4);c.lineTo(q.x+M.gl*.7,q.y-M.gl*.4);c.stroke();c.restore()}else{c.fillStyle='#ffb300';c.shadowColor='#ffb300';c.shadowBlur=8;c.fillRect(q.x-8,q.y-3,16,6);c.shadowBlur=0}}
{const n=this.gh.length;for(let i=0;i<n;i++){const h=this.gh[i],u=n>1?1-i/(n-1):0,col=sandCol(u).join(',');c.save();c.translate(h.x,h.y);c.rotate(h.a);c.fillStyle='rgb('+col+')';c.globalAlpha=.52;c.fillRect(-4+h.sw,-8,8,4);c.fillRect(-4-h.sw,4,8,4);c.beginPath();c.ellipse(0,0,7,11,0,0,TAU);c.fill();c.fillRect(4,2,h.gl,3.5);c.fillRect(2,-6,8,3);c.beginPath();c.arc(1,0,5.5,0,TAU);c.fill();c.globalAlpha=.5;c.strokeStyle='rgb('+col+')';c.lineWidth=1.5;c.beginPath();c.ellipse(0,0,7,11,0,0,TAU);c.stroke();c.restore()}}
// Cyberpsycho ghosts: copies of the player in the player's own colours, warped (stretched, skewed, rotated), close to the body. They come in bursts (CYG.on0 s, then gaps and bursts of 1-2 s) with glitch slices on the body and on every ghost.
if(!this.p.cyp)this.cgT0=null;else if(this.cgT0==null)this.cgT0=this.t;
const cgPv=this.cgOn;this.cgOn=!!(this.state==='play'&&(this.p.cyp?cyPhase(this.t-this.cgT0).on:this.syOn));if(this.state==='play'){if(this.cgOn&&!cgPv)Snd.play('cy_burst');else if(!this.cgOn&&cgPv&&this.p.cyp)Snd.play('cy_burst_end')}
if(this.cgOn){const q=this.p,gl=WEAP[q.ws[q.wi].id].gl,tk=performance.now()/CYG.hold|0,mv=Math.hypot(q.vx,q.vy)>20,gk=Math.floor(this.t*18);
for(let i=0,gn=this.cgN();i<gn;i++){const k=tk*7+i*13,ang=cyR(k)*TAU,d=(.25+.75*cyR(k+1))*CYG.spread,sx=.7+cyR(k+2)*.8,sy=.7+cyR(k+4)*.8,skx=(cyR(k+5)-.5)*1.2,sky=(cyR(k+6)-.5)*.8,rot=q.a+(cyR(k+3)-.5)*1.6;
c.save();c.translate(q.x+Math.cos(ang)*d,q.y+Math.sin(ang)*d);c.rotate(rot);c.transform(1,sky,skx,1,0,0);c.scale(sx,sy);c.globalAlpha=CYG.alpha;this.drawChar(0,0,0,'#00bcd4',q.ph,mv,gl,0,false,'#111',1);this.cySlices(0,0,0,gl,2,gk+i*3,q.ph,mv);c.restore()}}
const p=this.p;
for(const e of this.en)if(e.dead&&e.fk)this.drawChar(e.x,e.y,e.a,ET[e.t].col,e.ph,false,e.t==='M'?18:e.t==='O'?14:e.t==='R'?5:12,0,false,ET[e.t].hair,e.t==='H'?1.25:1);
for(const e of this.en)if(!e.dead){const T0=ET[e.t];
if(e.s==='patrol'||e.s==='alert')this.drawCone(e,T0);
this.drawChar(e.x,e.y,e.a,T0.col,e.ph,e.s!=='alert',e.t==='M'?18:e.t==='O'?14:e.t==='R'?5:12,e.fl,false,T0.hair,e.t==='H'?1.25:1);
if(e.sw>0){c.strokeStyle='rgba(232,67,147,'+e.sw*6+')';c.lineWidth=3;c.beginPath();c.arc(e.x,e.y,28,e.a-1,e.a+1);c.stroke()}
if(e.s!=='patrol'){c.fillStyle=e.s==='chase'?'#ff3b3b':'#ffd400';c.font='bold 16px sans-serif';c.textAlign='center';c.fillText(e.s==='search'?'?':'!',e.x,e.y-22)}}
this.drawPh();
if(!(p.dio&&this.tsv>0))this.drawPlayer();
c.lineWidth=2;for(const b of this.bl)if(b.on){if(b.th==='knife'){this.drawKnife(b)}else if(b.th){const M=WEAP[b.th],r=b.sp,dx=Math.cos(r)*M.gl*.6,dy=Math.sin(r)*M.gl*.6;c.strokeStyle=M.col;c.lineWidth=3;c.beginPath();c.moveTo(b.x-dx,b.y-dy);c.lineTo(b.x+dx,b.y+dy);c.stroke();c.lineWidth=2}else{c.strokeStyle=b.own?'#ff5a3a':'#fff3b0';c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x-b.vx*.022,b.y-b.vy*.022);c.stroke()}}
for(const q of this.pt)if(q.on){c.globalAlpha=q.l/q.ml;c.fillStyle=q.c;c.fillRect(q.x,q.y,q.sz,q.sz)}c.globalAlpha=1;
if(Save.d.set.light>=1&&this.L.lights){c.globalCompositeOperation='lighter';for(const l of this.L.lights){const x=l[0]*T,y=l[1]*T,fl=Save.d.set.light>=2&&!Save.d.set.reduceFlash?.55+.15*Math.sin(this.wt*3+x):.55,g=c.createRadialGradient(x,y,0,x,y,l[3]);g.addColorStop(0,l[2]);g.addColorStop(1,'transparent');c.globalAlpha=.16*fl;c.fillStyle=g;c.fillRect(x-l[3],y-l[3],l[3]*2,l[3]*2)}c.globalAlpha=1;c.globalCompositeOperation='source-over'}
if(p.dio&&this.tsv>0){this.tsGray();this.drawPlayer()}
if(Save.d.set.light>=3)this.bloom();
c.font='bold 12px sans-serif';c.textAlign='center';for(const o of this.pops){c.globalAlpha=Math.min(1,o.t*2);c.fillStyle=o.c;c.fillText(o.txt,o.x,o.y)}c.globalAlpha=1;
c.setTransform(1,0,0,1,0,0);
if((this.sdv>0||this.sdi>0)&&(this.state==='play'||this.state==='dead'))this.sandFx();
if((this.tsv>0||this.tsi>0)&&this.state==='play')this.tsFx();
if(Save.d.set.light>=1){const g=c.createRadialGradient(cv.width/2,cv.height/2,cv.height*.35,cv.width/2,cv.height/2,cv.height*.95);g.addColorStop(0,'transparent');g.addColorStop(1,'rgba(0,0,10,.65)');c.fillStyle=g;c.fillRect(0,0,cv.width,cv.height)}
if(Save.d.set.reduceFlash&&this.hv>.01&&(this.state==='play'||this.state==='dead')){const g=c.createRadialGradient(cv.width/2,cv.height/2,cv.height*.4,cv.width/2,cv.height/2,cv.height*.95);g.addColorStop(0,'transparent');g.addColorStop(1,'rgba(255,40,60,'+this.hv+')');c.fillStyle=g;c.fillRect(0,0,cv.width,cv.height)}
if(this.chroma>0&&!Save.d.set.reduceMotion&&(this.state==='play'||this.state==='dead'))this.chromaPass();
this.cyGlitch();
if(this.state==='play'||this.state==='dead'||this.state==='pause'){this.hud();if(this.rb)this.radioBar()}
if(Input.lock&&this.state==='play')this.cross()},
// Sandevistan screen treatment (from Crimson Dot): teal-green wash, crushed dark edges, scanlines, streaks right after activation,
// plus a 0.35s intro (white flash -> cyan wipe). Reduce flashing drops the white flash; Reduce motion drops the moving streaks.
sandFx(){const c=this.cx,cv=this.cv,w=cv.width,h=cv.height,d=this.d,S=Save.d.set,p=this.p;c.save();
if(this.sdv>0){const k=Math.min(1,this.sdv,Math.max(0,p.sd)/.3);
c.fillStyle='rgba(30,235,185,'+.2*k+')';c.fillRect(0,0,w,h);
const vg=c.createRadialGradient(w/2,h/2,h*.3,w/2,h/2,h*.85);vg.addColorStop(0,'rgba(0,20,16,0)');vg.addColorStop(1,'rgba(0,18,14,'+.62*k+')');c.fillStyle=vg;c.fillRect(0,0,w,h);
c.fillStyle='rgba(0,0,0,'+.12*k+')';for(let y=0;y<h;y+=4*d)c.fillRect(0,y,w,d);
if(!S.reduceMotion&&this.sdt<.55){const f=1-this.sdt/.55,q=Math.floor(this.t*30);for(let i=0;i<9;i++){const y=((i*197+q*53)%1000)/1000*h,bh=(6+(i*37)%26)*d,x=(((i*113+q*71)%400)-100)*d;c.fillStyle='rgba(90,255,235,'+.22*f+')';c.fillRect(x,y,w,bh)}}}
if(this.sdi>0){const u=1-this.sdi/.35,f=Math.min(1,u/.85);c.fillStyle='rgba(60,255,230,'+.6*(1-f)+')';c.fillRect(0,0,w,h);
if(!S.reduceMotion){const q=Math.floor(this.sdi*60);for(let i=0;i<12;i++){const y=((i*151+q*47)%1000)/1000*h,bh=(8+(i*29)%40)*d;c.fillStyle=i%3?'rgba(120,255,240,'+.55*(1-f)+')':'rgba(40,110,200,'+.55*(1-f)+')';c.fillRect(0,y,w,bh)}}
if(u<.25&&!S.reduceFlash){c.fillStyle='rgba(255,255,255,'+(1-u/.25)+')';c.fillRect(0,0,w,h)}}
c.restore()},
// Chromatic aberration: split the finished frame into R, G, B copies and re-add them with a horizontal offset. Runs only while the effect is active.
// Cyberpsycho screen glitch: strong while the ghosts are visible (cgOn), faint and intermittent in the gaps. Mixes sliced/shifted bands, cyan/magenta/red tinted bands and scanlines with a rolling bright bar. Off with Reduce motion; Reduce flashing halves it.
cyGlitch(){const p=this.p,S=Save.d.set,gm=p.cyp?1:(this.sy?this.sy.gi:0);if(!gm||this.state!=='play'||S.reduceMotion)return;
const c=this.cx,cv=this.cv,w=cv.width,h=cv.height,d=this.d,on=this.cgOn,f=Math.floor(this.t*(on?24:10));
if(!on&&cyR(f*1.7)>.45)return;
const I=(on?1:.3)*(S.reduceFlash?.5:1)*gm;
if(!this.cs){this.cs=document.createElement('canvas');this.cc=document.createElement('canvas')}
const Sc=this.cs;if(Sc.width!==w||Sc.height!==h){Sc.width=this.cc.width=w;Sc.height=this.cc.height=h}
const sx=Sc.getContext('2d');sx.setTransform(1,0,0,1,0,0);sx.drawImage(cv,0,0);
c.save();c.setTransform(1,0,0,1,0,0);
const n=Math.round(2+7*I),tint=['rgba(0,229,255,','rgba(255,43,214,','rgba(255,59,59,'];
for(let i=0;i<n;i++){const r=f*13+i*7,y=Math.floor(cyR(r)*h),bh=Math.max(2,Math.floor((3+cyR(r+1)*26)*d*(.5+I*.5))),dx=Math.round((cyR(r+2)-.5)*70*d*I);
c.drawImage(Sc,0,y,w,bh,dx,y,w,bh);
if(i%3===0){c.fillStyle=tint[(f+i)%3]+(.28*I)+')';c.fillRect(0,y,w,bh);c.drawImage(Sc,0,y,w,bh,-dx*.6,y,w,bh)}}
const sp=Math.max(2,Math.round(3*d));c.fillStyle='rgba(0,0,0,'+(.16*I)+')';for(let y=0;y<h;y+=sp*2)c.fillRect(0,y,w,sp);
const by=((this.t*(on?260:90))%(h+120*d))-60*d;c.fillStyle='rgba(120,255,240,'+(.06*I)+')';c.fillRect(0,by,w,40*d);
c.restore()},
chromaPass(){const c=this.cx,cv=this.cv,w=cv.width,h=cv.height;
if(!this.cs){this.cs=document.createElement('canvas');this.cc=document.createElement('canvas')}
const S=this.cs,C=this.cc;if(S.width!==w||S.height!==h){S.width=C.width=w;S.height=C.height=h}
const sx=S.getContext('2d'),cx=C.getContext('2d'),o=Math.round(this.chroma*6*this.d*Save.d.set.chromaAmt);if(o<1)return;
sx.setTransform(1,0,0,1,0,0);sx.drawImage(cv,0,0);
c.save();c.setTransform(1,0,0,1,0,0);c.fillStyle='#000';c.fillRect(0,0,w,h);c.globalCompositeOperation='lighter';
[['#f00',-o],['#0f0',0],['#00f',o]].forEach(([col,dx])=>{cx.globalCompositeOperation='source-over';cx.clearRect(0,0,w,h);cx.drawImage(S,0,0);cx.globalCompositeOperation='multiply';cx.fillStyle=col;cx.fillRect(0,0,w,h);c.drawImage(C,dx,0)});
c.restore()},
// Lighting quality 3 (High): cached glow sprites added with 'lighter' around bullets, muzzle flashes, pickups, intel, barrels and blasts.
bloom(){const c=this.cx,p=this.p;c.save();c.globalCompositeOperation='lighter';
for(const b of this.bl)if(b.on)this.glow(b.x,b.y,b.th?14:b.own?16:12,b.th?WEAP[b.th].col:b.own?'#ff5a3a':'#ffd27a',.55);
if(p.fl>0&&!Save.d.set.reduceFlash)this.glow(p.x+Math.cos(p.a)*(20+WEAP[p.ws[p.wi].id].gl),p.y+Math.sin(p.a)*(20+WEAP[p.ws[p.wi].id].gl),26,'#ffd27a',.7);
for(const q of this.pk)if(q.on)this.glow(q.x,q.y,18,WEAP[q.id].melee?WEAP[q.id].col:'#ffb300',.4);
for(const q of this.intel)if(q.on)this.glow(q.x,q.y,22,'#00e5ff',Save.d.set.reduceFlash?.5:.5+.2*Math.sin(this.wt*4+q.x));
for(const q of this.props)if(q.hp>0&&q.k==='B')this.glow((q.x+.5)*T,(q.y+.5)*T,24,'#ff3b3b',.3);
for(const r of this.rings)this.glow(r.x,r.y,96*(1-r.t/.35)+24,'#ffb300',r.t/.35*(Save.d.set.reduceFlash?.25:.6));
c.restore()},
glow(x,y,r,col,a){const s=this.gs[col]||(this.gs[col]=this.mkGlow(col));this.cx.globalAlpha=a;this.cx.drawImage(s,x-r,y-r,r*2,r*2)},
mkGlow(col){const k=document.createElement('canvas');k.width=k.height=64;const x=k.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,col);g.addColorStop(1,'transparent');x.fillStyle=g;x.fillRect(0,0,64,64);return k},
// HUD scale: portrait screens size by width so text never outgrows the narrow axis.
hudU(){const cv=this.cv;return cv.width<cv.height?cv.width/700*1.6:cv.height/700*(this.d>1?1:1.15)},
// Radio story banner: small bar under the objective text, fades in and out, never blocks input.
radioBar(){const c=this.cx,cv=this.cv,r=this.rb,u=this.hudU(),por=cv.width<cv.height,fs=13*u,mw=Math.min(cv.width*(por?.92:.7),560*u),x=(cv.width-mw)/2,y=(por?125:60)*u;
c.save();c.font='italic '+fs+'px sans-serif';
if(r.lw!==mw){const words=I18N.words('\u201c'+r.txt+'\u201d');r.lines=[];let cur='';for(const w of words){const t=cur+w;if(c.measureText(t.trimEnd()).width>mw-24*u&&cur){r.lines.push(cur.trimEnd());cur=w}else cur=t}r.lines.push(cur.trimEnd());r.lw=mw}
const h=r.lines.length*fs*1.35+26*u;c.globalAlpha=Math.max(0,Math.min(1,r.t*4,(r.max-r.t)*2));
c.fillStyle='rgba(6,6,18,.78)';c.fillRect(x,y,mw,h);c.fillStyle='#00e5ff';c.fillRect(x,y,3*u,h);
c.textAlign='left';c.font='bold '+10*u+'px monospace';c.fillText(TL('INCOMING TRANSMISSION'),x+12*u,y+13*u);
c.font='italic '+fs+'px sans-serif';c.fillStyle='#bfefff';r.lines.forEach((l,i)=>c.fillText(l,x+12*u,y+13*u+(i+1)*fs*1.35));c.restore()},
// Virtual crosshair, only drawn while the mouse is captured (the OS cursor is hidden then).
cross(){const c=this.cx,x=Input.mx,y=Input.my;c.save();c.strokeStyle='#00e5ff';c.lineWidth=2;c.beginPath();c.moveTo(x-12,y);c.lineTo(x-4,y);c.moveTo(x+4,y);c.lineTo(x+12,y);c.moveTo(x,y-12);c.lineTo(x,y-4);c.moveTo(x,y+4);c.lineTo(x,y+12);c.stroke();c.restore()},
// Enemy view cone: same range and half-angle the AI uses to spot the player, cut off by walls and closed doors.
drawCone(e,T0){const c=this.cx,N=36,a0=e.a-T0.fov,st=2*T0.fov/N;c.fillStyle=e.s==='alert'?'rgba(255,60,60,.12)':'rgba(255,255,255,.05)';c.beginPath();c.moveTo(e.x,e.y);
for(let i=0;i<=N;i++){const a=a0+i*st,d=rayDist(e.x,e.y,a,T0.vis);c.lineTo(e.x+Math.cos(a)*d,e.y+Math.sin(a)*d)}c.closePath();c.fill()},
// Static furniture baked into the cache. Tall units (3) block sight; low desks (4) do not.
furn(x,v,px,py,k){const ac=['#00e5ff','#ff2bd6','#ffb300'][k];
if(v===3){x.fillStyle='rgba(0,0,0,.35)';x.fillRect(px+4,py+T-6,T-4,6);x.fillStyle='#14142a';x.fillRect(px+2,py+2,T-4,T-4);x.fillStyle='#34345a';x.fillRect(px+2,py+2,T-4,T-12);x.fillStyle=ac;x.fillRect(px+2,py+2,T-4,2);x.fillStyle='#0c0c18';for(let s=0;s<3;s++)x.fillRect(px+5,py+6+s*6,T-10,2)}
else{x.fillStyle='rgba(0,0,0,.3)';x.fillRect(px+5,py+T-8,T-8,5);x.fillStyle='#3b3350';x.fillRect(px+3,py+7,T-6,T-14);x.strokeStyle=ac;x.globalAlpha=.7;x.lineWidth=1.5;x.strokeRect(px+3.5,py+7.5,T-7,T-15);x.globalAlpha=1;x.fillStyle=ac;x.globalAlpha=.5;x.fillRect(px+10,py+11,12,4);x.globalAlpha=1}},
// Dynamic world layer: crates, barrels, doors, intel, explosion rings and the door prompt.
drawWorld(){const c=this.cx,p=this.p;
for(const q of this.intel)if(q.on){c.save();c.shadowColor='#00e5ff';c.shadowBlur=Save.d.set.reduceFlash?9:6+6*Math.sin(this.wt*4+q.x);c.fillStyle='#0b2a3a';c.fillRect(q.x-7,q.y-9,14,18);c.strokeStyle='#00e5ff';c.lineWidth=1.5;c.strokeRect(q.x-7,q.y-9,14,18);c.fillStyle='#00e5ff';c.fillRect(q.x-4,q.y-5,8,1.5);c.fillRect(q.x-4,q.y-1,8,1.5);c.fillRect(q.x-4,q.y+3,5,1.5);c.restore()}
for(const q of this.props)if(q.hp>0||q.pend){const px=q.x*T,py=q.y*T;c.save();
if(q.k==='c'){c.fillStyle=q.fl>0&&!Save.d.set.reduceFlash?'#e8d2a0':'#6b4a25';c.fillRect(px+3,py+3,T-6,T-6);c.strokeStyle='#a7793d';c.lineWidth=2;c.strokeRect(px+4,py+4,T-8,T-8);c.beginPath();c.moveTo(px+4,py+4);c.lineTo(px+T-4,py+T-4);c.moveTo(px+T-4,py+4);c.lineTo(px+4,py+T-4);c.stroke()}
else{c.fillStyle=q.fl>0&&!Save.d.set.reduceFlash?'#ffd0b0':'#8a1f1f';c.beginPath();c.arc(px+16,py+16,11,0,TAU);c.fill();c.strokeStyle='#ffb300';c.lineWidth=2;c.beginPath();c.arc(px+16,py+16,6,0,TAU);c.stroke();c.fillStyle='#ffb300';c.fillRect(px+13,py+5,6,3)}
c.restore()}
for(const d of this.doors){const px=d.x*T,py=d.y*T,hz=this.grid[d.y][d.x-1]===1&&this.grid[d.y][d.x+1]===1,len=T*(1-.82*d.a);c.save();c.fillStyle=d.open?'#2c1a3a':'#5b1e3f';c.strokeStyle=d.open?'#00e5ff':'#ff2bd6';c.lineWidth=2;
if(hz){c.fillRect(px,py+11,len,10);c.strokeRect(px+1,py+12,len-2,8)}else{c.fillRect(px+11,py,10,len);c.strokeRect(px+12,py+1,8,len-2)}
c.restore();
if(this.state==='play'&&Math.hypot((d.x+.5)*T-p.x,(d.y+.5)*T-p.y)<46){c.save();c.fillStyle='#e8f6ff';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText(Input.useLabel()+(d.open?': '+TL('CLOSE'):': '+TL('OPEN')),px+16,py-4);c.restore()}}
if(this.state==='play'){const nk=this.nearPk();if(nk){c.save();c.fillStyle='#ffb300';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText(Input.useLabel()+': '+WEAP[nk.id].n,nk.x,nk.y-14);c.restore()}}
for(const r of this.rings){c.save();c.globalAlpha=r.t/.35;c.strokeStyle='#ffb300';c.lineWidth=4;c.beginPath();c.arc(r.x,r.y,96*(1-r.t/.35)+8,0,TAU);c.stroke();c.restore()}},
// Layered silhouette: shadow, feet, torso, arm+weapon, head, hair/mask.
drawChar(x,y,a,col,ph,moving,gl,fl,corpse,hair,sc,mz){const c=this.cx;c.save();c.translate(x,y);sc=sc||1;c.scale(sc,sc);
c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(2,4,11,8,0,0,TAU);c.fill();
if(corpse){c.rotate(a);c.fillStyle='#4a0d18';c.beginPath();c.ellipse(0,0,14,10,0,0,TAU);c.fill();c.fillStyle=col;c.globalAlpha=.55;c.beginPath();c.ellipse(0,0,10,7,0,0,TAU);c.fill();c.restore();return}
c.rotate(a);const sw=moving?Math.sin(ph)*3.5:0;
c.fillStyle='#0d0d14';c.fillRect(-4+sw,-8,8,4);c.fillRect(-4-sw,4,8,4);
c.fillStyle=fl>0&&!Save.d.set.reduceFlash?'#fff':col;c.beginPath();c.ellipse(0,0,7,11,0,0,TAU);c.fill();
c.fillStyle='#ff2bd6';c.fillRect(-2,-11,3,22);
c.fillStyle='#1a1a22';c.fillRect(4,2,gl,3.5);c.fillStyle='#555';c.fillRect(4,2,gl,1);c.fillStyle=col;c.fillRect(2,-6,8,3);
if(fl>0&&mz){c.fillStyle='#ffd27a';c.beginPath();c.moveTo(4+gl,3.7);c.lineTo(4+gl+11,0);c.lineTo(4+gl+11,7);c.fill()}
c.fillStyle='#e8c9a0';c.beginPath();c.arc(1,0,5.5,0,TAU);c.fill();c.fillStyle=hair||'#111';c.beginPath();c.arc(-1,0,5.2,Math.PI*.55,Math.PI*1.45);c.fill();c.restore()},
// A knife in flight (also hanging in the air during a time stop): drawn straight along its flight direction, no spin, with a short streak while it moves.
drawKnife(b){const c=this.cx,v=Math.hypot(b.vx,b.vy);c.save();c.translate(b.x,b.y);c.rotate(b.ang);
if(v>30){const g=c.createLinearGradient(-10-v*.02,0,-9,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,.55)');c.strokeStyle=g;c.lineWidth=2;c.beginPath();c.moveTo(-10-v*.02,0);c.lineTo(-9,0);c.stroke()}
c.fillStyle='#4a1d1d';c.fillRect(-9,-1.6,6,3.2);c.fillStyle='#8f959b';c.fillRect(-3.4,-3,1.6,6);
c.fillStyle='#eef4ff';c.strokeStyle='#7d8aa0';c.lineWidth=.8;c.beginPath();c.moveTo(-2,-2.2);c.lineTo(8,-2.2);c.lineTo(14,0);c.lineTo(-2,2.2);c.closePath();c.fill();c.stroke();
c.restore()},
hud(){const c=this.cx,cv=this.cv,p=this.p,u=this.hudU(),por=cv.width<cv.height,rm=Math.max(por?0:70*u,56*this.d),pad=12*u,w=p.ws[p.wi],W=WEAP[w.id];
c.font='bold '+14*u+'px monospace';c.textAlign='left';c.fillStyle='#000a';c.fillRect(pad,pad,160*u,12*u);c.fillStyle=p.hp>35?'#00e5ff':'#ff3b3b';c.fillRect(pad,pad,160*u*p.hp/100,12*u);
c.fillStyle='#e8f6ff';c.fillText(TL('SCORE')+' '+this.score,pad,pad+32*u);if(this.combo>1){c.fillStyle='#ff2bd6';c.fillText(TL('COMBO')+' x'+this.mult+' ('+this.combo+')',pad,pad+52*u);c.fillRect(pad,pad+58*u,100*u*Math.max(0,this.ct/3),4*u)}
c.textAlign='right';c.fillStyle='#ffb300';c.fillText(W.n,cv.width-rm-pad,pad+14*u);c.fillStyle='#e8f6ff';c.fillText(p.rlt>0?TL('RELOADING...'):W.kn?TL('KNIVES x3 - UNLIMITED'):W.melee?TL('MELEE (FIRE = THROW)'):w.mag+' / '+w.res,cv.width-rm-pad,pad+34*u);
const left=this.en.filter(e=>!e.dead).length;c.textAlign='center';c.fillStyle='#e8f6ff';c.fillText(left?TL('ELIMINATE ALL HOSTILES')+': '+left:TL('REACH EXTRACTION'),cv.width/2,pad+(por?80:14)*u);if(this.intel.length){c.fillStyle='#00e5ff';c.fillText(TL('INTEL')+' '+this.intelGot+' / '+this.intel.length,cv.width/2,pad+(por?102:34)*u)}
if(p.dio){const on=p.ts>0,rd=p.tm>=TSC.min,fr=p.tm/TSC.max,bw=120*u,bh=8*u,bx=cv.width-rm-pad-bw,by=cv.height-pad-bh,col=on?'#ffd400':rd?'#ffe98a':'#8a7a3a';c.textAlign='right';c.fillStyle=col;c.fillText(TL('TIME STOP')+' '+(on?p.tm.toFixed(1)+'s':TL(rd?'READY':'CHARGING')),bx+bw,by-6*u);c.fillStyle='#000a';c.fillRect(bx,by,bw,bh);c.fillStyle=col;c.fillRect(bx,by,bw*Math.max(0,Math.min(1,fr)),bh)}
else{const sa=p.sd>0,fr=p.cy,bw=120*u,bh=8*u,bx=cv.width-rm-pad-bw,by=cv.height-pad-bh,col=p.cyp?'#ff3b3b':sa?(fr>.7?'#ff2bd6':'#00e5ff'):'#7cff6b';c.textAlign='right';c.fillStyle=col;c.fillText(p.cyp?TL('CYBERPSYCHO'):TL('SANDE')+' '+TL(sa?'ON':'READY'),bx+bw,by-6*u);c.fillStyle='#000a';c.fillRect(bx,by,bw,bh);c.fillStyle=col;c.fillRect(bx,by,bw*Math.max(0,Math.min(1,fr)),bh);c.fillStyle='#000c';for(const a of CYS.at)c.fillRect(bx+bw*a-u*.5,by,Math.max(1,u),bh)}
for(const s of['l','r']){const t=Input.st[s];if(t){const R=Input.R*this.d;c.globalAlpha=Save.d.set.opacity;c.strokeStyle='#00e5ff';c.lineWidth=3;c.beginPath();c.arc(t.x0*this.d,t.y0*this.d,R,0,TAU);c.stroke();c.fillStyle='#00e5ff88';const v=Input.vec(s);c.beginPath();c.arc((t.x0+v.x*Input.R)*this.d,(t.y0+v.y*Input.R)*this.d,R*.4,0,TAU);c.fill();c.globalAlpha=1}}},
});
