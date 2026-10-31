'use strict';
// Enemy archetypes: vis=sight range, fov=half view angle, rng=attack range, keep=preferred distance, aim=aim delay
// R (rusher): melee=true, mrng=strike reach, mdmg=strike damage, aim=wind-up before the strike lands.
// O (elite): cover=true, fires bursts then retreats behind cover before peeking again.
const ET={
E:{hp:40,spd:75,vis:300,fov:.9,rng:260,keep:150,cd:.9,dmg:10,react:.5,col:'#c0392b',hair:'#222',acc:.16,aim:0},
H:{hp:130,spd:48,vis:260,fov:.8,rng:160,keep:50,cd:.5,dmg:14,react:.7,col:'#7d3c98',hair:'#111',acc:.22,aim:0,r:13},
M:{hp:30,spd:65,vis:420,fov:.6,rng:420,keep:280,cd:1.6,dmg:22,react:.6,col:'#d68910',hair:'#eee',acc:.03,aim:.7},
R:{hp:55,spd:125,vis:320,fov:1,rng:0,keep:0,cd:.7,dmg:0,react:.35,col:'#e84393',hair:'#222',acc:0,aim:.22,melee:true,mrng:30,mdmg:16},
O:{hp:70,spd:95,vis:360,fov:.85,rng:300,keep:170,cd:.45,dmg:11,react:.4,col:'#2e4057',hair:'#ff2bd6',acc:.07,aim:.25,cover:true}};
Object.assign(G,{
mkE(t,x,y){return{t,x,y,hx:x,hy:y,a:Math.random()*TAU,hp:ET[t].hp,s:'patrol',tm:0,cd:1,fl:0,ph:Math.random()*6,wx:x,wy:y,wt:1,lx:x,ly:y,sx:x,sy:y,lost:0,aimt:0,dead:0,bx:0,sw:0,cph:0,cn:0,cx:x,cy:y,ct:0,hide:0,path:null,pi:0,pgx:-1,pgy:-1,pt:0,stk:0,stc:0,gu:0,sf:1,sft:0}},
// Hit effects play at once; the damage itself is held (e.pd) while DIO has time stopped and lands in one go when time runs again (see updTsFx).
hitE(e,dmg,a,melee){e.fl=.1;this.emit(e.x,e.y,melee?10:6,'#b01030',110,.5,2);if(this.t>=(this.hst||0)){Snd.play('hit');this.hst=this.t}if(e.s==='patrol'||e.s==='search'){if(this.p.ts>0)e.hts=1;else this.setChase(e)}
if(this.tsc()===0){e.pd=(e.pd||0)+dmg;return}
this.hurtE(e,dmg)},
hurtE(e,dmg){e.hp-=dmg;if(e.hp<=0){e.dead=1;e.dt=0;e.fk=(this.p.sd>0||this.p.ts>0)?1:0;this.kills++;this.combo++;this.mult=Math.min(5,1+(this.combo>>1));this.ct=3;const pts=100*this.mult;this.score+=pts;this.pop(e.x,e.y,'+'+pts+(this.mult>1?' x'+this.mult:''),'#00e5ff');this.shake(5);Snd.play('kill');Save.d.stats.kills++}},
});
