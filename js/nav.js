'use strict';
// Enemy navigation: A* over the tile grid + line-of-travel smoothing. Enemies treat floor and doors as walkable
// (doors are opened as they approach); walls, furniture, crates and barrels are obstacles.
function nsolid(x,y){if(x<0||y<0)return true;const tx=x/T|0,ty=y/T|0;if(tx>=G.mw||ty>=G.mh)return true;const v=G.grid[ty][tx];return v>0&&v!==2}
function nblocked(x,y,r){return nsolid(x-r,y-r)||nsolid(x+r,y-r)||nsolid(x-r,y+r)||nsolid(x+r,y+r)}
// True if a body of radius r can travel the straight segment a->b (closed doors count as passable: they get opened on the way).
function clearLine(ax,ay,bx,by,r){const d=Math.hypot(bx-ax,by-ay),n=Math.ceil(d/6);for(let i=1;i<=n;i++)if(nblocked(ax+(bx-ax)*i/n,ay+(by-ay)*i/n,r))return false;return true}
Object.assign(G,{
// Binary-heap A*, 8-way with no corner cutting. Returns world-space waypoints (start excluded) or null when unreachable.
findPath(sx,sy,gx,gy,r){const W=this.mw,H=this.mh,g=this.grid,walk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&(g[y][x]===0||g[y][x]===2);
const fix=(x,y)=>{if(walk(x,y))return[x,y];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(walk(x+dx,y+dy))return[x+dx,y+dy];return null};
const s=fix(sx/T|0,sy/T|0),t=fix(gx/T|0,gy/T|0);if(!s||!t)return null;
if(s[0]===t[0]&&s[1]===t[1])return[{x:gx,y:gy}];
const N=W*H,gs=new Float32Array(N).fill(1e9),par=new Int32Array(N).fill(-1),done=new Uint8Array(N),hp=[],hf=[];
const push=(i,f)=>{let k=hp.length;hp.push(i);hf.push(f);while(k>0){const p=(k-1)>>1;if(hf[p]<=hf[k])break;[hp[p],hp[k]]=[hp[k],hp[p]];[hf[p],hf[k]]=[hf[k],hf[p]];k=p}};
const pop=()=>{const r0=hp[0],li=hp.pop(),lf=hf.pop();if(hp.length){hp[0]=li;hf[0]=lf;let k=0;for(;;){let a=k*2+1,b=a+1,m=k;if(a<hp.length&&hf[a]<hf[m])m=a;if(b<hp.length&&hf[b]<hf[m])m=b;if(m===k)break;[hp[m],hp[k]]=[hp[k],hp[m]];[hf[m],hf[k]]=[hf[k],hf[m]];k=m}}return r0};
const h=(x,y)=>{const dx=Math.abs(x-t[0]),dy=Math.abs(y-t[1]);return Math.max(dx,dy)+.414*Math.min(dx,dy)};
const si=s[1]*W+s[0],ti=t[1]*W+t[0];gs[si]=0;push(si,h(s[0],s[1]));
while(hp.length){const c=pop();if(done[c])continue;done[c]=1;if(c===ti)break;const cx=c%W,cy=c/W|0;
for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=cx+dx,ny=cy+dy;if(!walk(nx,ny))continue;
if(dx&&dy&&(!walk(cx+dx,cy)||!walk(cx,cy+dy)))continue;
const ni=ny*W+nx;if(done[ni])continue;const ng=gs[c]+(dx&&dy?1.414:1)+(g[ny][nx]===2?1:0);if(ng<gs[ni]){gs[ni]=ng;par[ni]=c;push(ni,ng+h(nx,ny))}}}
if(!done[ti])return null;
const tiles=[];for(let i=ti;i!==-1;i=par[i])tiles.push(i);tiles.reverse();
const pts=[{x:sx,y:sy}];for(let i=1;i<tiles.length;i++)pts.push({x:(tiles[i]%W+.5)*T,y:((tiles[i]/W|0)+.5)*T});
if(walk(gx/T|0,gy/T|0))pts[pts.length-1]={x:gx,y:gy};
// String-pulling: keep only the waypoints needed to hug corners.
const out=[];let c=0;while(c<pts.length-1){let k=pts.length-1;while(k>c+1&&!clearLine(pts[c].x,pts[c].y,pts[k].x,pts[k].y,r))k--;out.push(pts[k]);c=k}
return out},
// Opens any closed door directly in front of (or beside) the body's path. Enemies never close doors.
openAhead(e,ux,uy,r){for(const dd of[r+6,r+14,r+24])for(const o of[0,-r*.8,r*.8]){const x=e.x+ux*dd-uy*o,y=e.y+uy*dd+ux*o,tx=x/T|0,ty=y/T|0;
if(this.grid[ty]&&this.grid[ty][tx]===2){const dr=this.doorAt(tx,ty);if(dr)this.toggleDoor(dr,false)}}},
// Walk toward (tx,ty), routing around walls/furniture and through doors. Returns straight-line distance left.
// Sets e.gu=1 when the target is unreachable or the enemy keeps getting stuck, so callers can give up instead of pushing at a wall.
goTo(e,tx,ty,spd,dt,face){const r=(ET[e.t].r||11)-3,d=Math.hypot(tx-e.x,ty-e.y);e.gu=0;e.pt-=dt;
if(d<=2){e.bx=0;return d}
const px=e.x,py=e.y;
if(clearLine(e.x,e.y,tx,ty,r)){e.path=null;this.step(e,tx,ty,spd,dt,face)}
else{const gx=tx/T|0,gy=ty/T|0;
if(!e.path||e.stk>.45||(e.pt<=0&&(e.pgx!==gx||e.pgy!==gy))){e.path=this.findPath(e.x,e.y,tx,ty,r);e.pi=0;e.pgx=gx;e.pgy=gy;e.pt=.35;e.stk=0}
if(!e.path){e.gu=1;return d}
const P=e.path;let w=P[e.pi];while(e.pi<P.length-1&&Math.hypot(w.x-e.x,w.y-e.y)<6)w=P[++e.pi];
for(let k=P.length-1;k>e.pi;k--)if(clearLine(e.x,e.y,P[k].x,P[k].y,r)){e.pi=k;w=P[k];break}
this.step(e,w.x,w.y,spd,dt,face)}
// Stuck watchdog: barely moved while trying to -> repath; repeated failures -> give up.
if(Math.hypot(e.x-px,e.y-py)<spd*dt*.25){e.stk+=dt;if(e.stk>.45&&++e.stc>=4){e.gu=1;e.stc=0;e.path=null}}else{e.stk=Math.max(0,e.stk-dt*2);e.stc=Math.max(0,e.stc-dt*.5)}
return Math.hypot(tx-e.x,ty-e.y)},
});
