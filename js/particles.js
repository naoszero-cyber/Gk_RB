'use strict';
Object.assign(G,{
emit(x,y,n,c,sp,life,sz,ang,spread){n=Math.ceil(n*Save.d.set.part);for(let i=0;i<n;i++){const q=this.pt[this.pi++%300],a=ang===undefined?Math.random()*TAU:ang+(Math.random()-.5)*(spread||0),v=sp*(.3+Math.random());Object.assign(q,{on:1,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:life,ml:life,c,sz})}},
pop(x,y,txt,c){if(this.pops.length>14)this.pops.shift();this.pops.push({x,y,t:1,txt,c})},
updParticles(dt){
for(const q of this.pt)if(q.on){q.l-=dt;if(q.l<=0){q.on=0;continue}q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.94;q.vy*=.94}
},
// Floating score / info texts always run in real time (never frozen or slowed by time stop or Sandevistan).
updPops(dt){for(let i=this.pops.length-1;i>=0;i--){const o=this.pops[i];o.t-=dt;o.y-=20*dt;if(o.t<=0)this.pops.splice(i,1)}},
});
