'use strict';
// Room ids by flood fill. Walls (#) and doors (D) divide rooms; door tiles get id 0 (no room). Computed once per mission from the map text, so doors count as dividers whether open or closed.
function roomMap(rows){const h=rows.length,w=rows[0].length,R=rows.map(()=>new Array(w).fill(0));let id=0;
for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(R[y][x]||rows[y][x]==='#'||rows[y][x]==='D')continue;id++;const st=[[x,y]];R[y][x]=id;
while(st.length){const[cx,cy]=st.pop();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=w||ny>=h||R[ny][nx])continue;const ch=rows[ny][nx];if(ch==='#'||ch==='D')continue;R[ny][nx]=id;st.push([nx,ny])}}}
return R}
Object.assign(G,{
load(i){const L=LEVELS[i];this.lvlI=i;this.L=L;const mw=Math.max(...L.map.map(r=>r.length)),rows=L.map.map(r=>r.padEnd(mw,'#'));this.mw=mw;this.mh=rows.length;this.grid=[];this.en=[];this.pk=[];this.ex=null;this.doors=[];this.props=[];this.rings=[];this.intel=[];this.rq=[];this.rb=null;
rows.forEach((r,y)=>{const g=[];for(let x=0;x<mw;x++){const c=r[x],px=x*T+T/2,py=y*T+T/2;g.push(TILE[c]||0);if(c==='D')this.doors.push({x,y,open:0,a:0});else if(c==='c'||c==='B')this.props.push({x,y,k:c,hp:c==='c'?30:20,fl:0});
if(c==='P')this.p=this.mkP(px,py);else if(ET[c])this.en.push(this.mkE(c,px,py));else if(PK[c])this.pk.push({x:px,y:py,id:PK[c],on:1});else if(c==='X')this.ex={x:px,y:py};else if(c==='N')this.intel.push({x:px,y:py,on:1})}this.grid.push(g)});
for(const b of this.bl)b.on=0;for(const q of this.pt)q.on=0;
Object.assign(this,{intelGot:0,pops:[],score:0,combo:0,mult:1,ct:0,time:0,shots:0,hits:0,dmgT:0,kills:0,sh:0,chroma:0,hv:0,hurtT:0,total:this.en.length,dead:0,ovShown:0,tsOn:false,tsv:0,tsi:0,tst:0});
if(this.char===1)this.dioInit(this.p);this.room=roomMap(rows);this.cam.x=this.p.x;this.cam.y=this.p.y;this.buildCache()},
start(i){this.load(i);{const b=document.querySelector('#tc [data-act="sand"]');if(b){b.dataset.en=this.char===1?'THE WORLD':'SANDE';b.textContent=TL(b.dataset.en)}}this.state='play';UI.hide();Save.d.stats.runs++;this.radio('start')},
retry(){this.start(this.lvlI)},
// Radio story: each line plays once per session and per mission as a small banner. The game keeps running; lines queue one after another.
radio(key){const t=this.L.story&&TL(this.L.story[key]),h=this.heard||(this.heard={}),id=this.lvlI+':'+key;if(!t||h[id])return;h[id]=1;this.rq.push(t);if(!this.rb)this.nextRadio()},
nextRadio(){if(!this.rq.length)return;const t=this.rq.shift();this.rb={txt:t,t:0,max:Math.max(4.5,2+t.length*.04)}},
updStory(dt){if(this.rb){this.rb.t+=dt;if(this.rb.t>=this.rb.max){this.rb=null;this.nextRadio()}}
if(this.state!=='play')return;const left=this.en.filter(e=>!e.dead).length;
if(this.total>=4&&left>0&&left<=2)this.radio('low');
if(this.intel.length&&this.intelGot===this.intel.length)this.radio('intel');
if(this.total>0&&left===0)this.radio('exit')},
intelTotal(i){let n=0;for(const r of LEVELS[i].map)for(const ch of r)if(ch==='N')n++;return n},
complete(){this.state='done';Snd.play('win');const acc=this.shots?Math.min(1,this.hits/this.shots):0,tb=Math.max(0,Math.round((240-this.time)*4)),ab=Math.round(acc*400),dp=Math.round(this.dmgT*3),base=Math.max(0,this.score+tb+ab-dp),ib=this.intelGot*INTEL_PTS,tot=base+ib,
rank=tot>=1800?'S':tot>=1400?'A':tot>=1000?'B':tot>=600?'C':'D';
const r={acc,tb,ab,dp,tot,rank,time:this.time,kills:this.kills,kscore:this.score,ib,intel:this.intelGot,intelMax:this.intel.length},b=Save.d.best[this.lvlI];
const pi=b&&b.intel||0,ni=Math.max(pi,this.intelGot);
if(!b||tot>b.score)Save.d.best[this.lvlI]={score:tot,time:this.time,rank,intel:ni};else{if(this.time<b.time)b.time=this.time;b.intel=ni}
Save.d.stats.intel=(Save.d.stats.intel||0)+ni-pi;
Save.d.unlock=Math.max(Save.d.unlock,Math.min(LEVELS.length,this.lvlI+2));Save.save();UI.results(r)},
});
