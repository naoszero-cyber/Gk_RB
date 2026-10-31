'use strict';
const T=32,TAU=Math.PI*2;
const adiff=(a,b)=>{let d=a-b;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d};
const lerpA=(a,b,t)=>a+adiff(b,a)*Math.min(1,t);
// Tile kinds: 0 floor, 1 wall, 2 closed door, 3 tall furniture, 4 low furniture, 5 crate, 6 barrel.
// solid() stops movement and bullets; sight is also stopped by everything except low furniture (4) and barrels (6).
function solid(x,y){if(x<0||y<0)return true;const tx=x/T|0,ty=y/T|0;return tx>=G.mw||ty>=G.mh||G.grid[ty][tx]>0}
function sightBlock(x,y){if(x<0||y<0)return true;const tx=x/T|0,ty=y/T|0;if(tx>=G.mw||ty>=G.mh)return true;const v=G.grid[ty][tx];return v>0&&v!==4&&v!==6}
function blocked(x,y,r){return solid(x-r,y-r)||solid(x+r,y-r)||solid(x-r,y+r)||solid(x+r,y+r)}
// Axis-separated movement gives wall sliding.
function mv(o,dx,dy,r){if(!blocked(o.x+dx,o.y,r))o.x+=dx;else o.bx=1;if(!blocked(o.x,o.y+dy,r))o.y+=dy;else o.bx=1}
// Line of sight: sample the segment every 8px against wall tiles.
function los(ax,ay,bx,by){const d=Math.hypot(bx-ax,by-ay),n=Math.ceil(d/8);for(let i=1;i<n;i++){if(sightBlock(ax+(bx-ax)*i/n,ay+(by-ay)*i/n))return false}return true}
// Distance from (x,y) along angle a to the first sight-blocking tile edge, capped at maxd (grid DDA walk, cheap enough for hundreds of rays per frame).
function rayDist(x,y,a,maxd){const dx=Math.cos(a),dy=Math.sin(a);let tx=x/T|0,ty=y/T|0;const sx=dx>0?1:-1,sy=dy>0?1:-1,
tdx=dx===0?1e9:T/Math.abs(dx),tdy=dy===0?1e9:T/Math.abs(dy);
let nx=dx===0?1e9:(dx>0?(tx+1)*T-x:x-tx*T)/Math.abs(dx),ny=dy===0?1e9:(dy>0?(ty+1)*T-y:y-ty*T)/Math.abs(dy);
for(;;){let t;if(nx<ny){t=nx;nx+=tdx;tx+=sx}else{t=ny;ny+=tdy;ty+=sy}
if(t>=maxd)return maxd;if(tx<0||ty<0||tx>=G.mw||ty>=G.mh)return t;const v=G.grid[ty][tx];if(v>0&&v!==4&&v!==6)return t}}
// Line of fire: like los() but low furniture and barrels also block (used for cover and blasts).
function lof(ax,ay,bx,by){const d=Math.hypot(bx-ax,by-ay),n=Math.ceil(d/8);for(let i=1;i<n;i++){if(solid(ax+(bx-ax)*i/n,ay+(by-ay)*i/n))return false}return true}
