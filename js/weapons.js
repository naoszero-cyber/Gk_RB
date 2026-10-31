'use strict';
const WEAP={
pistol:{n:'PISTOL',dmg:34,rate:.28,mag:12,res:48,rl:.9,sp:.04,spd:720,pel:1,rng:640,snd:'pistol',gl:10},
smg:{n:'SMG',dmg:16,rate:.075,mag:30,res:90,rl:1.3,sp:.1,spd:760,pel:1,rng:560,snd:'smg',gl:14},
shotgun:{n:'SHOTGUN',dmg:20,rate:.8,mag:6,res:18,rl:1.6,sp:.28,spd:640,pel:7,rng:300,snd:'shotgun',gl:18},
rifle:{n:'ASSAULT RIFLE',dmg:24,rate:.1,mag:30,res:120,rl:1.5,sp:.05,spd:820,pel:1,rng:700,snd:'rifle',gl:17,rc:.07},
// Melee / scene weapons: occupy a Q slot. Space strikes (dmg, cd=cooldown, sw=swing time, reach px, arc=half-angle, nz=noise radius).
// Fire throws the weapon once (thd dmg, ths speed, thr range) and it is lost.
// Knives (DIO's weapon, slot 1, unlimited): LMB held = a volley of 3 knives thrown in an inverted umbrella cone that all converge on the aim point.
// dmg per knife, rate = seconds between volleys, spd/rng = knife speed and range, spr = sideways offset of the outer knives at the muzzle (px),
// fd = aim distance used when there is no mouse point (touch) and no enemy to lock on, tr/ta = touch lock-on range (px) and half-angle (rad), fmin = nearest allowed aim point, nz = noise radius.
knives:{n:'KNIVES',kn:1,dmg:34,rate:.2,spd:620,rng:560,spr:30,fd:260,tr:350,ta:.35,fmin:60,nz:100,mag:0,res:0,gl:0},
fist:{n:'FISTS',melee:1,dmg:55,cd:.45,sw:.18,reach:46,arc:1.1,nz:120,col:'#ffffff',gl:0},
club:{n:'CLUB',melee:1,dmg:75,cd:.55,sw:.2,reach:52,arc:1.2,nz:140,col:'#ffd27a',gl:12,mag:0,res:0,thd:45,ths:520,thr:380},
pipe:{n:'IRON PIPE',melee:1,dmg:100,cd:.8,sw:.25,reach:60,arc:.9,nz:160,col:'#9be7ff',gl:16,mag:0,res:0,thd:60,ths:500,thr:360},
knife:{n:'KNIFE',melee:1,dmg:60,cd:.28,sw:.12,reach:38,arc:.6,nz:50,col:'#ffffff',gl:7,mag:0,res:0,thd:70,ths:620,thr:420}};
// Level-map letters for floor pickups.
// Optional objective: map letter N = intel item, worth this many points each (added after the rank is decided).
const INTEL_PTS=500;
// Level-map letters for tiles: # wall, D door (closed), T tall furniture, t low furniture, c crate, B explosive barrel.
const TILE={'#':1,D:2,T:3,t:4,c:5,B:6};
const PK={W:'smg',S:'shotgun',A:'rifle',C:'club',I:'pipe',K:'knife'};
