'use strict';
// Web Audio. Sound effects use embedded samples (js/sfx-data.js, mapped in SFX_MAP below); the synth sounds in play() are the fallback if a sample is missing or not decoded yet, and the music loop in tick() stays procedural. Initialised on first user gesture.
// Event -> sample layers. s = sample ids (one picked at random), v = volume, r = playback-rate range. Events not listed here use the synth fallback.
const SFX_MAP={pistol:[{s:['gun_pistol'],v:1,r:[.97,1.03]}],smg:[{s:['gun_smg'],v:.8,r:[.95,1.1]}],rifle:[{s:['gun_rifle'],v:.9,r:[.96,1.04]}],
shotgun:[{s:['gun_shotgun'],v:1,r:[.97,1.03]}],efire:[{s:['gun_pistol'],v:.5,r:[1.15,1.3]}],reload:[{s:['gun_reload'],v:.7,r:[1,1]}],sande_on:[{s:['sande_on'],v:.8,r:[1,1]}],sande_off:[{s:['sande_off'],v:.7,r:[1,1]}],ts_on:[{s:['ts_on'],v:.9,r:[1,1]}],ts_off:[{s:['ts_off'],v:.9,r:[1,1]}],cy_start:[{s:['cy_start'],v:.9,r:[1,1]},{s:['cy_glitch'],v:.6,r:[1,1]}],cy_burst:[{s:['cy_burst'],v:.7,r:[.95,1.05]}],cy_burst_end:[{s:['cy_burst_end'],v:.5,r:[.95,1.05]}],cy_end:[{s:['cy_end'],v:.8,r:[1,1]}],
ph_fire:[{s:['gun_pistol'],v:.4,r:[1.15,1.3]}],boom:[{s:['boom'],v:1,r:[.95,1.05]}]};
const Snd={ctx:null,nb:null,n:0,buf:{},
init(){if(this.ctx){this.ctx.resume();return}try{this.ctx=new(window.AudioContext||window.webkitAudioContext)();setInterval(()=>this.tick(),170);this.loadSamples()}catch(e){}},
loadSamples(){if(typeof SFX_DATA==='undefined')return;for(const k in SFX_DATA){try{const s=atob(SFX_DATA[k]),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);this.ctx.decodeAudioData(u.buffer,b=>{this.buf[k]=b},()=>{})}catch(e){}}},
sample(n,v){const L=SFX_MAP[n];if(!L||v<=.001)return false;const c=this.ctx;let ok=false;for(const l of L){const b=this.buf[l.s[Math.random()*l.s.length|0]];if(!b)continue;const s=c.createBufferSource(),g=c.createGain();s.buffer=b;s.playbackRate.value=l.r[0]+Math.random()*(l.r[1]-l.r[0]);g.gain.value=Math.min(1,v*l.v);s.connect(g);g.connect(c.destination);s.start();ok=true}return ok},
v(k){return Save.d.set.master*Save.d.set[k]},
tone(f,d,type,v,sl){const c=this.ctx;if(!c||v<=.001)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(20,f*sl),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d)},
noise(d,v){const c=this.ctx;if(!c||v<=.001)return;if(!this.nb){this.nb=c.createBuffer(1,c.sampleRate/2,c.sampleRate);const a=this.nb.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1}const s=c.createBufferSource(),g=c.createGain(),t=c.currentTime;s.buffer=this.nb;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(g);g.connect(c.destination);s.start(t,0,d)},
play(n){if(!this.ctx)return;const v=this.v('sfx');if(this.sample(n,v))return;switch(n){
case'pistol':this.noise(.1,v*.5);this.tone(190,.1,'square',v*.3,.4);break;
case'smg':this.noise(.06,v*.4);this.tone(150,.06,'square',v*.25,.5);break;
case'rifle':this.noise(.07,v*.45);this.tone(120,.09,'sawtooth',v*.28,.45);break;
case'throw':this.noise(.12,v*.3);this.tone(300,.1,'triangle',v*.15,1.8);break;
case'door':this.noise(.12,v*.25);this.tone(160,.12,'square',v*.15,.6);break;
case'crate':this.noise(.15,v*.4);this.tone(110,.08,'square',v*.2,.5);break;
case'boom':this.noise(.6,v*.9);this.tone(60,.5,'sawtooth',v*.6,.3);break;
case'shotgun':this.noise(.28,v*.8);this.tone(90,.2,'sawtooth',v*.4,.4);break;
case'efire':this.noise(.08,v*.3);this.tone(140,.08,'square',v*.2,.5);break;
case'melee':this.noise(.1,v*.35);break;case'hit':this.tone(220,.08,'square',v*.3,.5);break;
case'hurt':this.tone(130,.25,'sawtooth',v*.5,.5);break;case'step':this.noise(.04,v*.07);break;
case'alert':this.tone(900,.12,'square',v*.15,1.6);break;case'ui':this.tone(620,.05,'square',v*.15);break;
case'reload':this.tone(300,.05,'square',v*.2);setTimeout(()=>this.tone(450,.06,'square',v*.2),350);break;
case'pickup':this.tone(500,.12,'triangle',v*.35,2);break;case'dash':this.noise(.15,v*.2);break;
case'kill':this.tone(330,.12,'triangle',v*.35,.5);break;
case'sande_on':this.noise(.2,v*.25);this.tone(200,.3,'sawtooth',v*.2,3);break;case'sande_off':this.tone(600,.3,'sawtooth',v*.2,.3);break;
case'cy_start':this.noise(.3,v*.4);this.tone(120,.4,'sawtooth',v*.35,.4);break;case'cy_end':this.tone(300,.3,'triangle',v*.3,.4);break;
case'cy_burst':this.noise(.2,v*.3);break;
case'ts_on':this.tone(880,.08,'square',v*.3);setTimeout(()=>this.tone(660,.08,'square',v*.3),110);setTimeout(()=>{this.noise(.5,v*.35);this.tone(90,.7,'sawtooth',v*.35,.3)},230);break;
case'ts_off':this.tone(300,.25,'triangle',v*.35,3);this.noise(.3,v*.25);setTimeout(()=>this.tone(880,.08,'square',v*.25),260);break;
case'ph_fire':this.noise(.08,v*.25);this.tone(140,.08,'square',v*.15,.5);break;
case'win':[392,494,587,784].forEach((f,i)=>setTimeout(()=>this.tone(f,.25,'triangle',v*.4),i*120));break;
case'fail':this.tone(220,.9,'sawtooth',v*.5,.25);break}},
// Simple dark synth-bass loop; only while a mission is running.
tick(){if(!this.ctx||typeof G==='undefined'||G.state!=='play')return;const m=this.v('music');this.n++;const b=[55,55,82,55,65,55,98,82][this.n%8];this.tone(b,.16,'sawtooth',m*.18);if(this.n%2)this.noise(.03,m*.12);if(this.n%16===0)this.tone(440,.5,'triangle',m*.1,.7)}};
