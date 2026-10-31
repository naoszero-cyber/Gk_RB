'use strict';
// Sandevistan: toggled on/off with no cooldown and no time limit. While active, enemies, all bullets (including the player's) and particles run at SAND.slow of normal speed; the player stays at full speed.
const SAND={slow:.05,haste:1.5};
// Cyberpsycho: the gauge (p.cy, 0..1) fills in CY.fill seconds of Sandevistan use and drains over CY.drain seconds otherwise. When full, Sandevistan is forced off and the player goes psycho (no control, auto-chases and attacks the nearest enemy, loses CY.bleed HP/s only while the ghost copies are visible) until the gauge is empty.
// floor = fraction of max HP (100) that the psycho bleed never takes you below (other damage still can).
const CY={fill:10,drain:15,bleed:2,floor:.25};
// Cyberpsycho reflexes: near = enemy distance that auto-triggers Sandevistan, look/lane = bullet scan range / miss distance (px), chance = dodge chance per incoming bullet, step = sidestep time (s), blast = distance from a barrel blast (px; the blast radius is 96) inside which it runs away, bdash = distance inside which it also dashes.
const CYA={near:200,look:180,lane:16,chance:.5,step:.25,blast:116,bdash:60};
// Cyberpsycho ghosts: n copies, spread = max offset (px), alpha, hold = ms before they jump to new spots. Timing: first burst lasts on0 s, then gaps of offMin..offMax s alternate with bursts of onMin..onMax s.
const CYG={n:7,spread:22,alpha:.4,hold:90,on0:1,onMin:1,onMax:2,offMin:1,offMax:2};
// Cyberpsycho warning stages (before the gauge is full): each gauge level in `at` switches on the next stage, one per entry, and the symptoms get heavier with the stage. Arrays are indexed by stage (1 = first level).
// Symptoms come in bursts like the psycho ghosts: on = burst length (s), off = gap (s), both randomised +-25%. During a burst: ghosts = ghost copies of the player, glitch = screen glitch strength (0..1), phantoms = hallucinated enemies per burst (0 = none),
// shake = screen shake at the start of each burst, bleed = HP lost per second (never below CY.floor of max HP, like the psycho bleed; 0 for stages 1-2, so no HP loss under 50%). Stage 1 is glitch + sound only, ghosts from stage 2, phantoms from stage 4. A stage ends when the gauge drops back under its level.
const CYS={at:[.15,.3,.5,.7,.85],ghosts:[0,2,3,5,6],glitch:[.25,.4,.6,.8,.95],phantoms:[0,0,0,1,2],shake:[1,2,3,5,7],bleed:[0,0,1.5,2,2.5],on:[.7,.9,1.1,1.4,1.7],off:[5,4,3,2.2,1.5]};
const G={state:'menu',mw:30,mh:19,grid:[],en:[],bl:[],pt:[],pk:[],pops:[],cam:{x:0,y:0},s:1,d:1,sh:0,t:0,pi:0,lvlI:0,p:null,ex:null,cache:null,gs:{},char:0,
init(cv){this.cv=cv;this.cx=cv.getContext('2d');for(let i=0;i<220;i++)this.bl.push({on:0});for(let i=0;i<300;i++)this.pt.push({on:0});
addEventListener('resize',()=>this.resize());addEventListener('orientationchange',()=>setTimeout(()=>this.resize(),200));this.resize();this.load(0)},
update(dt){this.t+=dt;const st=this.state;
if(st!=='play'&&st!=='dead'){Input.once={};return}
if(st==='play'){if(Input.once.Escape){UI.pause();Input.once={};return}this.time+=dt;this.updPlayer(dt)}
else{this.dead+=dt;if(this.dead>1&&!this.ovShown){this.ovShown=1;UI.dead()}if(this.dead>1&&Input.once.KeyR)this.retry()}
const ks=this.tsc(),wdt=dt*ks;this.wt+=wdt;this.updSand(dt);this.updTsFx(dt);
if(ks>0)for(const e of this.en)this.updEn(e,wdt);
this.updPh(wdt);
if(ks>0){for(const b of this.bl)if(b.on)this.updB(b,wdt)}else{for(const b of this.bl)if(b.on&&b.hv)this.updB(b,dt)}
if(ks>0)this.updParticles(wdt);
this.updWorld(dt);this.updPops(dt);this.updStory(dt);
if(this.ct>0){this.ct-=dt;if(this.ct<=0&&this.combo>0){this.combo=0;this.mult=1}}
this.updCam(dt,st);Input.once={}},
// Sandevistan visuals (real-time dt), ported from Crimson Dot: 0.35s activation flash + cyan streak wipe, then a long chain of
// afterimages (no fading, newest cyan -> blue -> violet -> olive -> maroon) that all vanish the moment the skill ends.
sdv:0,sdi:0,sdt:0,sdOn:false,gh:[],gt:0,lgx:0,lgy:0,
updSand(dt){const p=this.p,on=!!(p&&p.sd>0&&this.state==='play');
if(on&&!this.sdOn){this.sdi=.35;this.sdt=0;this.gh=[];this.gt=0;this.lgx=p.x;this.lgy=p.y;Snd.play('sande_on')}
if(!on&&this.sdOn){if(p&&!(p.sd>0))Snd.play('sande_off');this.gh=[];for(const e of this.en)e.fk=0}
this.sdOn=on;if(this.sdi>0)this.sdi=Math.max(0,this.sdi-dt);
if(on)this.sdt+=dt;
this.sdv+=((on?1:0)-this.sdv)*Math.min(1,dt*(on?12:7));if(this.sdv<.01)this.sdv=0;
if(on){this.gt-=dt;const moved=Math.hypot(p.x-this.lgx,p.y-this.lgy);
if(moved>=7||(this.gt<=0&&moved>.4)){this.gt=.05;this.lgx=p.x;this.lgy=p.y;this.gh.push({x:p.x,y:p.y,a:p.a,gun:!WEAP[p.ws[p.wi].id].melee,gl:WEAP[p.ws[p.wi].id].gl,sw:Math.hypot(p.vx,p.vy)>20?Math.sin(p.ph)*3.5:0});if(this.gh.length>110)this.gh.shift()}}},
};
