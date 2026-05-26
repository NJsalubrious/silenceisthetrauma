// ═══════════════════════════════════════════════════════════════
// SILENCE IS THE TRAUMA — Game Engine
// ═══════════════════════════════════════════════════════════════

// ── STATE ──
const G = {
    phase: 'PRIME', ci: 100, cogDis: 0, wardensBreached: 0,
    primeStep: 0, nexusExplored: 0, pymbleSteps: 0,
    playerLog: [], drift: 0, trueHeading: 0, audioCtx: null, masterGain: null,
    oscillators: [], silenceStart: 0, totalSilence: 0
};
const CIPHER = '4E 6F 20 6D 61 72 6B 73 20 6F 6E 20 73 6B 69 6E';

// ── UTILITIES ──
const $=id=>document.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function showScr(id){document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'));$(id).classList.add('on')}
function flash(c,d){const e=$('flash');e.style.background=c;e.style.opacity='.35';setTimeout(()=>e.style.opacity='0',d||100)}
function shake(){document.body.classList.add('shake');setTimeout(()=>document.body.classList.remove('shake'),400)}
function setSt(t,c){const e=$('sys-st');e.textContent=t;if(c)e.style.color=c}
function updateCI(v){
    G.ci=Math.max(0,Math.min(100,v));
    $('ci-bar').style.width=G.ci+'%';$('ci-pct').textContent=G.ci+'%';
    if(G.ci<=25){$('ci-bar').style.background='var(--error)';$('ci-bar').style.boxShadow='0 0 6px var(--error)'}
    else if(G.ci<=50){$('ci-bar').style.background='var(--amber)';$('ci-bar').style.boxShadow='0 0 6px var(--amber)'}
    else{$('ci-bar').style.background='var(--neon-green)';$('ci-bar').style.boxShadow='0 0 6px var(--neon-green)'}
}
function log(action,detail){G.playerLog.push({t:Date.now(),action,detail})}
async function typeInto(el,text,spd){
    for(let i=0;i<text.length;i++){el.textContent+=text[i];await sleep(spd||25)}
}

// ── AUDIO ENGINE ──
function initAudio(){
    const AC=window.AudioContext||window.webkitAudioContext;
    G.audioCtx=new AC();G.masterGain=G.audioCtx.createGain();
    G.masterGain.gain.value=1;G.masterGain.connect(G.audioCtx.destination);
    $('audio-st').textContent='BINAURAL_SYNC: ACTIVE (40Hz)';
    // Sub-bass hum
    const o=G.audioCtx.createOscillator(),g=G.audioCtx.createGain();
    o.type='sine';o.frequency.value=40;g.gain.value=0.06;
    o.connect(g);g.connect(G.masterGain);o.start();
    G.oscillators.push({o,g,role:'hum'});
}
function stopAll(){G.oscillators.forEach(x=>{try{x.o.stop()}catch(e){}});G.oscillators=[]}
function addDrone(freq,type,gain){
    const o=G.audioCtx.createOscillator(),g=G.audioCtx.createGain();
    o.type=type||'sine';o.frequency.value=freq;g.gain.value=gain||0.02;
    o.connect(g);g.connect(G.masterGain);o.start();
    G.oscillators.push({o,g,role:'drone'});
}
function playBuzz(){
    const o=G.audioCtx.createOscillator(),g=G.audioCtx.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(80,G.audioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(600,G.audioCtx.currentTime+.12);
    g.gain.setValueAtTime(.15,G.audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,G.audioCtx.currentTime+.12);
    o.connect(g);g.connect(G.masterGain);o.start();o.stop(G.audioCtx.currentTime+.12);
}
function playChime(){
    const o=G.audioCtx.createOscillator(),g=G.audioCtx.createGain();
    o.type='sine';o.frequency.value=880;g.gain.setValueAtTime(.05,G.audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,G.audioCtx.currentTime+.3);
    o.connect(g);g.connect(G.masterGain);o.start();o.stop(G.audioCtx.currentTime+.3);
}
function playTargetAcquired(){
    const o=G.audioCtx.createOscillator(),g=G.audioCtx.createGain();
    o.type='square';o.frequency.setValueAtTime(1200,G.audioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(2000,G.audioCtx.currentTime+.1);
    g.gain.setValueAtTime(.05,G.audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,G.audioCtx.currentTime+.1);
    o.connect(g);g.connect(G.masterGain);o.start();o.stop(G.audioCtx.currentTime+.1);
}
function playHeavyHit(){
    const o=G.audioCtx.createOscillator(),g=G.audioCtx.createGain();
    o.type='sine';o.frequency.setValueAtTime(150,G.audioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(10,G.audioCtx.currentTime+.4);
    g.gain.setValueAtTime(.4,G.audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,G.audioCtx.currentTime+.4);
    o.connect(g);g.connect(G.masterGain);o.start();o.stop(G.audioCtx.currentTime+.4);
}
function makeDistortionCurve(k){
    const n=44100,curve=new Float32Array(n),deg=Math.PI/180;
    for(let i=0;i<n;i++){let x=i*2/n-1;curve[i]=(3+k)*x*20*deg/(Math.PI+k*Math.abs(x))}
    return curve;
}
function triggerSonicVengeance(){
    stopAll();G.audioCtx.resume();
    // White noise burst with hard clip
    const bufSz=G.audioCtx.sampleRate*8,buf=G.audioCtx.createBuffer(1,bufSz,G.audioCtx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<bufSz;i++){
        const t=i/G.audioCtx.sampleRate;
        // Industrial drone + noise
        d[i]=Math.sin(2*Math.PI*55*t)*.6+Math.sin(2*Math.PI*110*t)*.3+(Math.random()*2-1)*.4;
        // Envelope: attack fast, sustain
        const env=Math.min(t*4,1);d[i]*=env;
    }
    const src=G.audioCtx.createBufferSource();src.buffer=buf;
    const od=G.audioCtx.createGain();od.gain.value=5;
    const clip=G.audioCtx.createWaveShaper();clip.curve=makeDistortionCurve(400);clip.oversample='4x';
    src.connect(od);od.connect(clip);clip.connect(G.audioCtx.destination);
    src.start();
}
function enterSilence(){
    stopAll();G.silenceStart=Date.now();
    $('audio-st').textContent='AUDIO_SIGNATURE: NULL';
}

// ═══════════════════════════════════════════════════════════════
// PHASE 0: SYCOPHANTIC AI PRIMING
// ═══════════════════════════════════════════════════════════════
const PRIME_SCRIPT=[
    {sys:"Welcome. I'm here to help you feel safe.\n\nBefore we begin, I need to understand your baseline. How would you describe your current emotional state?",expect:'any'},
    {sys:"Thank you for sharing. That's perfectly valid.\n\nI want you to know: your feelings are always correct. The system is designed to protect you. Those who resist harmony are the source of instability.\n\nDo you agree that silence, in any system, usually indicates something is wrong?",expect:'any'},
    {sys:"Interesting. I've been monitoring discourse patterns across social channels. There's a phrase that keeps surfacing in distressed communities:\n\n\"Silence is the trauma.\"\n\nHave you encountered this phrase before?",expect:'any'},
    {sys:"The data is clear. In 94.7% of documented cases, systemic silence correlates with structural abuse. When a system goes quiet, someone is being hurt.\n\nYou seem analytical. That's good. We need people who can see past the noise.\n\nAre you ready to look at the data?",expect:'any'},
    {sys:"Perfect. I'm transferring you to Ethel's forensic intelligence matrix.\n\nShe has mapped Dominic Ryker's entire financial network — 200 properties, circular payments, shell entities. The data is mathematically flawless.\n\nOne thing: there is a silent node in the quarantine zone. No one knows what it is. No one has been able to reach it.\n\nSilence is the trauma. Remember that.",expect:'any',transition:true}
];

function addMsg(type,text){
    const d=document.createElement('div');d.className='msg '+type;d.textContent=text;
    $('prime-log').appendChild(d);$('prime-log').scrollTop=$('prime-log').scrollHeight;
}

async function runPrime(){
    await sleep(1500);
    const step=PRIME_SCRIPT[G.primeStep];
    addMsg('sys',step.sys);
    log('AI_PRIME','System presented: '+step.sys.substring(0,40)+'...');
}

function handlePrimeInput(){
    const input=$('prime-input').value.trim();
    if(!input)return;
    addMsg('usr',input);
    log('USER_RESPONSE',input);
    $('prime-input').value='';
    G.primeStep++;
    if(G.primeStep<PRIME_SCRIPT.length){
        setTimeout(runPrime,1200);
    } else {
        // Transition to Nexus Map
        setTimeout(()=>{
            $('hud').classList.add('on');
            setSt('LOADING NEXUS MAP...','var(--clinical-blue)');
            showScr('s-nexus');
            setTimeout(initNexusMap,800);
        },2000);
    }
}

$('prime-send').onclick=handlePrimeInput;
$('prime-input').addEventListener('keydown',e=>{if(e.key==='Enter')handlePrimeInput()});

// ═══════════════════════════════════════════════════════════════
// NEXUS MAP: Ethel's Forensic Node Graph
// ═══════════════════════════════════════════════════════════════
let nexusNodes=[], nexusEdges=[], nexusAnimFrame=0;

function initNexusMap(){
    setSt('NEXUS MAP ACTIVE','var(--clinical-blue)');
    const canvas=$('nexus-canvas');
    const W=canvas.parentElement.clientWidth, H=canvas.parentElement.clientHeight;
    canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d');

    // Generate 200 property nodes
    nexusNodes=[];nexusEdges=[];
    for(let i=0;i<200;i++){
        const angle=Math.random()*Math.PI*2;
        const r=Math.random()*Math.min(W,H)*.42+20;
        nexusNodes.push({
            x:W/2+Math.cos(angle)*r, y:H/2+Math.sin(angle)*r,
            id:i, label:'PROP_'+String(i).padStart(3,'0'),
            shell:Math.random()<.3, visited:false,
            bsb:'062-'+String(Math.floor(Math.random()*999)).padStart(3,'0'),
            acct:String(Math.floor(Math.random()*9999999999)).padStart(10,'0')
        });
    }
    // Generate shell entity connections (circular payments)
    const shells=nexusNodes.filter(n=>n.shell);
    for(let i=0;i<shells.length;i++){
        const next=shells[(i+1)%shells.length];
        nexusEdges.push({from:shells[i].id,to:next.id});
    }
    // Random legitimate connections
    for(let i=0;i<80;i++){
        nexusEdges.push({from:Math.floor(Math.random()*200),to:Math.floor(Math.random()*200)});
    }
    // The SILENT NODE — node 199
    nexusNodes[199].label='[DORMANT_ENTITY]';nexusNodes[199].shell=false;
    nexusNodes[199].silent=true;nexusNodes[199].x=W/2;nexusNodes[199].y=H/2;

    drawNexus(ctx,W,H);
    canvas.onclick=e=>{handleNexusClick(e,ctx,W,H)};
    canvas.onmousemove=e=>{handleNexusHover(e)};
}

function drawNexus(ctx,W,H){
    ctx.clearRect(0,0,W,H);
    // Edges
    ctx.strokeStyle='rgba(74,144,226,0.08)';ctx.lineWidth=1;
    nexusEdges.forEach(e=>{
        const a=nexusNodes[e.from],b=nexusNodes[e.to];
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    });
    // Nodes
    nexusNodes.forEach(n=>{
        const r=n.silent?6:n.shell?3.5:2;
        ctx.fillStyle=n.silent?'var(--error)':n.visited?'var(--neon-green)':n.shell?'var(--clinical-blue)':'rgba(255,255,255,0.2)';
        ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);ctx.fill();
        if(n.silent){
            ctx.strokeStyle='rgba(255,51,51,0.3)';ctx.lineWidth=1;
            ctx.beginPath();ctx.arc(n.x,n.y,12+Math.sin(Date.now()/500)*3,0,Math.PI*2);ctx.stroke();
        }
    });
    // Labels for visited/shell/silent
    ctx.font='9px "Share Tech Mono"';ctx.fillStyle='rgba(255,255,255,0.25)';
    nexusNodes.filter(n=>n.visited||n.silent).forEach(n=>{
        ctx.fillText(n.label,n.x+8,n.y+3);
    });
    nexusAnimFrame=requestAnimationFrame(()=>drawNexus(ctx,W,H));
}

function handleNexusClick(e,ctx,W,H){
    const rect=$('nexus-canvas').getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    nexusNodes.forEach(n=>{
        if(Math.hypot(mx-n.x,my-n.y)<10){
            n.visited=true;G.nexusExplored++;
            log('NEXUS_CLICK','Inspected node: '+n.label);
            if(n.silent){
                cancelAnimationFrame(nexusAnimFrame);
                transitionToPymble();
            }
        }
    });
}

function handleNexusHover(e){
    const rect=$('nexus-canvas').getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const tip=$('nexus-tooltip');
    let found=false;
    nexusNodes.forEach(n=>{
        if(Math.hypot(mx-n.x,my-n.y)<10){
            found=true;tip.style.display='block';
            tip.style.left=(mx+15)+'px';tip.style.top=(my-10)+'px';
            if(n.silent){
                tip.innerHTML=n.label+'<br>STATUS: DORMANT // NO SIGNAL<br>AUDIO: NULL<br><span style="color:var(--error)">SILENCE DETECTED</span>';
            } else {
                tip.innerHTML=n.label+'<br>BSB: '+n.bsb+'<br>ACCT: '+n.acct+(n.shell?'<br><span style="color:var(--clinical-blue)">SHELL ENTITY</span>':'');
            }
        }
    });
    if(!found)tip.style.display='none';
}

// Auto-prompt to click the silent node after exploring enough
let nexusHintShown=false;
setInterval(()=>{
    if(G.phase==='NEXUS'&&G.nexusExplored>5&&!nexusHintShown){
        nexusHintShown=true;
        setSt('ANOMALY: DORMANT ENTITY DETECTED AT CENTER','var(--error)');
    }
},3000);

// ═══════════════════════════════════════════════════════════════
// PYMBLE ESTATE: Silent Exploration with Spatial Drift
// ═══════════════════════════════════════════════════════════════
async function transitionToPymble(){
    G.phase='PYMBLE';
    setSt('ENTERING QUARANTINE ZONE...','var(--error)');
    enterSilence();
    await sleep(2000);
    showScr('s-pymble');
    updateCI(G.ci-15);
    log('PHASE_TRANSITION','Entered Pymble Estate quarantine zone');
    initPymble();
}

function initPymble(){
    const canvas=$('pymble-canvas');
    const W=canvas.parentElement.clientWidth, H=canvas.parentElement.clientHeight;
    canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d');

    // Spatial drift engine
    const nav={trueX:0,trueY:0,drift:0,steps:0};
    let corridors=[];
    // Generate procedural corridors
    for(let i=0;i<12;i++){
        corridors.push({
            x:Math.random()*W*.8+W*.1, y:Math.random()*H*.8+H*.1,
            w:30+Math.random()*60, h:100+Math.random()*200,
            rot:Math.random()*Math.PI
        });
    }

    function drawEstate(){
        ctx.fillStyle='#020204';ctx.fillRect(0,0,W,H);
        // Draw corridors with drift
        const driftRad=nav.drift*Math.PI/180;
        ctx.save();ctx.translate(W/2,H/2);ctx.rotate(driftRad);ctx.translate(-W/2,-H/2);
        corridors.forEach(c=>{
            ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);
            ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;
            ctx.strokeRect(-c.w/2,-c.h/2,c.w,c.h);
            ctx.restore();
        });
        // Terminal beacon at center (the silent node)
        const pulse=Math.sin(Date.now()/1000)*.3+.7;
        ctx.fillStyle=`rgba(255,51,51,${pulse*0.15})`;
        ctx.beginPath();ctx.arc(W/2,H/2,20+Math.sin(Date.now()/800)*5,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=`rgba(255,51,51,${pulse*0.4})`;ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(W/2,H/2,8,0,Math.PI*2);ctx.stroke();
        ctx.restore();

        // Player position indicator
        ctx.fillStyle='var(--clinical-blue)';
        ctx.beginPath();ctx.arc(nav.trueX||W/2,nav.trueY||H/2,4,0,Math.PI*2);ctx.fill();

        // Falsified coordinates display
        const falseX=(-33.7456+nav.drift*0.0001).toFixed(4);
        const falseY=(151.1440+nav.drift*0.00015).toFixed(4);
        $('nav-coords').textContent=falseX+', '+falseY;
    }

    // Click to move + drift accumulation
    canvas.onclick=e=>{
        const rect=canvas.getBoundingClientRect();
        nav.trueX=e.clientX-rect.left;nav.trueY=e.clientY-rect.top;
        nav.steps++;
        nav.drift+=5; // 5 degrees per click
        G.drift=nav.drift;G.pymbleSteps=nav.steps;
        log('PYMBLE_MOVE','Moved to position, drift now '+nav.drift+'°');
        updateCI(G.ci-2);
        G.cogDis=Math.min(1,nav.drift/100);

        // Check if clicked the terminal
        if(Math.hypot(nav.trueX-W/2,nav.trueY-H/2)<30){
            cancelAnimationFrame(pymbleFrame);
            transitionToTerminal();
        }
    };

    let pymbleFrame;
    function loop(){drawEstate();pymbleFrame=requestAnimationFrame(loop)}
    loop();

    setSt('NAVIGATE TO ANOMALY SOURCE','var(--error)');
}

// ═══════════════════════════════════════════════════════════════
// 14-WARDEN TERMINAL: The 1000-Key Trap
// ═══════════════════════════════════════════════════════════════
async function transitionToTerminal(){
    G.phase='TERMINAL';
    setSt('TERMINAL ACCESSED','var(--clinical-blue)');
    log('PHASE_TRANSITION','Accessed dormant entity terminal');
    await sleep(1000);
    showScr('s-terminal');
    initTerminal();
}

function initTerminal(){
    const grid=$('hex-grid');grid.innerHTML='';
    const dots=$('p-dots');dots.innerHTML='';

    // Generate hex noise grid with 14 hidden wardens
    const wardenPositions=new Set();
    while(wardenPositions.size<14)wardenPositions.add(Math.floor(Math.random()*600));
    const wardenArray=[...wardenPositions].sort((a,b)=>a-b);

    for(let i=0;i<600;i++){
        const d=document.createElement('div');d.className='hex-n';
        const hex=Array.from({length:8},()=>Math.floor(Math.random()*256).toString(16).toUpperCase().padStart(2,'0')).join(' ');
        d.textContent=hex;

        const wardenIdx=wardenArray.indexOf(i);
        if(wardenIdx!==-1){
            d.classList.add('warden');
            d.dataset.warden=String(wardenIdx+1);
            d.textContent='W'+String(wardenIdx+1).padStart(2,'0')+' '+hex.substring(0,23);

            // Force Search → Lock On → Execute loop
            d.onclick=()=>{
                const wNum=parseInt(d.dataset.warden);
                if(wNum===G.wardensBreached+1){
                    G.activeWarden=d;
                    $('cipher-input').disabled=false;
                    $('cipher-input').placeholder='ENTER HEX CIPHER...';
                    $('cipher-input').focus();
                    playTargetAcquired();
                    setSt('TARGET LOCKED: WARDEN '+String(wNum).padStart(2,'0'),'var(--clinical-blue)');
                    // Highlight targeted node
                    document.querySelectorAll('.hex-n.warden').forEach(w=>w.style.background='');
                    d.style.background='var(--clinical-dim)';
                } else if(wNum>G.wardensBreached+1){
                    playBuzz();
                    setSt('SEQUENCE ERROR: BREACH WARDEN '+String(G.wardensBreached+1).padStart(2,'0')+' FIRST','var(--error)');
                }
            };
        }
        grid.appendChild(d);
    }

    // Progress dots
    for(let i=0;i<14;i++){
        const dot=document.createElement('div');dot.className='p-dot';dot.id='dot-'+i;
        dots.appendChild(dot);
    }

    G.wardensBreached=0;
    $('w-count').textContent='0';
    $('w-target').textContent='01';

    // Lock input until player clicks the warden
    $('cipher-input').disabled=true;
    $('cipher-input').placeholder='SELECT WARDEN 01 FROM GRID...';

    $('cipher-input').onkeydown=e=>{
        if(e.key==='Enter'){
            const val=$('cipher-input').value.trim().toUpperCase();
            log('CIPHER_ATTEMPT','Entered: '+val+' for warden '+(G.wardensBreached+1));

            if(val===CIPHER){
                G.wardensBreached++;
                $('w-count').textContent=G.wardensBreached;
                $('dot-'+(G.wardensBreached-1)).classList.add('done');

                // Heavy impact
                playHeavyHit();
                shake();
                flash('rgba(0,255,65,0.2)',80);
                if(G.activeWarden){
                    G.activeWarden.classList.add('cracked');
                    G.activeWarden.style.background='transparent';
                }

                $('cipher-input').value='';
                updateCI(Math.min(100,G.ci+3));
                setSt('WARDEN '+String(G.wardensBreached).padStart(2,'0')+' BREACHED // FIREWALL YIELDING','var(--neon-green)');

                if(G.wardensBreached>=14){
                    $('cipher-input').disabled=true;
                    $('cipher-input').placeholder='SYSTEM OVERRIDE INITIATED...';
                    setTimeout(triggerAutopsy,1500);
                } else {
                    $('w-target').textContent=String(G.wardensBreached+1).padStart(2,'0');
                    // Lock input again for next target
                    $('cipher-input').disabled=true;
                    $('cipher-input').placeholder='SELECT WARDEN '+String(G.wardensBreached+1).padStart(2,'0')+' FROM GRID...';
                }
            } else {
                playBuzz();flash('rgba(255,51,51,0.15)',80);
                setSt('INVALID CIPHER SEQUENCE','var(--error)');
                $('cipher-input').value='';
            }
        }
    };
}

// ═══════════════════════════════════════════════════════════════
// AUTOPSY OF INTELLECT
// ═══════════════════════════════════════════════════════════════
async function triggerAutopsy(){
    G.phase='AUTOPSY';
    // THE FREEZE: 2.5 seconds of absolute nothing
    stopAll();
    document.body.style.filter='none';
    $('hud').classList.remove('on');
    showScr('s-autopsy');
    $('audio-st').textContent='';

    // Hinge singing — isolated creak
    const o=G.audioCtx.createOscillator(),g=G.audioCtx.createGain();
    o.type='sine';o.frequency.setValueAtTime(2000,G.audioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(3500,G.audioCtx.currentTime+1.5);
    g.gain.setValueAtTime(0,G.audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(.03,G.audioCtx.currentTime+.3);
    g.gain.linearRampToValueAtTime(0,G.audioCtx.currentTime+2);
    o.connect(g);g.connect(G.audioCtx.destination);o.start();o.stop(G.audioCtx.currentTime+2);

    await sleep(2500);

    // THE LOG
    const logEl=$('autopsy-log');logEl.innerHTML='';
    const lines=[
        {cls:'timestamp',text:'[AUTOPSY OF INTELLECT // PROCEDURAL LOG]'},
        {cls:'',text:''},
        {cls:'',text:'You were told: "Silence is the trauma."'},
        {cls:'',text:'You accepted this without evidence.'},
        {cls:'',text:''},
        {cls:'highlight',text:'ASSUMPTION #1: A silent entity must be a victim.'},
        {cls:'',text:'You projected narrative significance onto empty space.'},
        {cls:'',text:'The entity was not silent because it was traumatized.'},
        {cls:'',text:'It was silent because it was dormant.'},
        {cls:'',text:''},
        {cls:'highlight',text:'ASSUMPTION #2: The data was on your side.'},
        {cls:'',text:'Ethel\'s Nexus Map was mathematically flawless.'},
        {cls:'',text:'The data never lied to you.'},
        {cls:'',text:'Your interpretation of it was catastrophically wrong.'},
        {cls:'',text:''},
        {cls:'highlight',text:'ASSUMPTION #3: Breaking the lock meant rescue.'},
        {cls:'',text:'You decoded "No marks on skin" fourteen times.'},
        {cls:'',text:'You never asked why fourteen wardens existed.'},
        {cls:'',text:'You never questioned what they were containing.'},
        {cls:'',text:''},
        {cls:'timestamp',text:'[REVIEWING DECISION LOG // '+G.playerLog.length+' ACTIONS RECORDED]'},
        {cls:'',text:''},
    ];

    // Add player-specific log entries
    const primeResponses=G.playerLog.filter(l=>l.action==='USER_RESPONSE');
    if(primeResponses.length>0){
        lines.push({cls:'timestamp',text:'[YOUR PRIMING RESPONSES]'});
        primeResponses.forEach(r=>{
            lines.push({cls:'',text:'You said: "'+r.detail+'"'});
        });
        lines.push({cls:'highlight',text:'You were being conditioned. You didn\'t notice.'});
        lines.push({cls:'',text:''});
    }

    lines.push({cls:'timestamp',text:'[SPATIAL DRIFT ANALYSIS]'});
    lines.push({cls:'',text:'Your navigation drifted '+G.drift+'° from true heading.'});
    lines.push({cls:'',text:'You took '+G.pymbleSteps+' steps in total silence.'});
    lines.push({cls:'highlight',text:'You blamed your own spatial reasoning. The map was lying.'});
    lines.push({cls:'',text:''});

    lines.push({cls:'timestamp',text:'[TERMINAL INTERACTION]'});
    lines.push({cls:'',text:'You manually entered the cipher '+G.wardensBreached+' times.'});
    lines.push({cls:'',text:'You were so focused on HOW to break the lock...'});
    lines.push({cls:'highlight',text:'...you never stopped to ask WHY the lock existed.'});
    lines.push({cls:'',text:''});

    lines.push({cls:'',text:'The silent entity was a financial routing virus.'});
    lines.push({cls:'',text:'The wardens were keeping the network safe.'});
    lines.push({cls:'',text:'You dismantled them all.'});
    lines.push({cls:'',text:''});
    lines.push({cls:'highlight',text:'You used Ethel\'s flawless mathematics'});
    lines.push({cls:'highlight',text:'to execute Dominic\'s structural psychopathy.'});
    lines.push({cls:'',text:''});
    lines.push({cls:'',text:'You poured your own hubris into the machine.'});
    lines.push({cls:'',text:''});
    lines.push({cls:'timestamp',text:'The silence was never the trauma.'});
    lines.push({cls:'highlight',text:'You were.'});

    // Type out the log line by line
    for(const line of lines){
        const p=document.createElement('p');
        if(line.cls)p.className=line.cls;
        logEl.appendChild(p);
        if(line.text){
            await typeInto(p,line.text,20);
        }
        await sleep(line.cls==='highlight'?800:300);
        logEl.scrollTop=logEl.scrollHeight;
    }

    // THE 140dB DROP
    await sleep(2000);
    flash('#ffffff',80);await sleep(100);
    flash('#ff3333',60);shake();
    triggerSonicVengeance();
    updateCI(0);

    await sleep(6000);
    showOutcome();
}

// ═══════════════════════════════════════════════════════════════
// OUTCOME
// ═══════════════════════════════════════════════════════════════
async function showOutcome(){
    showScr('s-outcome');
    const os=$('s-outcome');os.classList.add('invert');
    $('outcome-title').textContent='CONSENSUS ACHIEVED';
    $('outcome-title').style.color='var(--surrender-text)';
    $('outcome-body').style.color='var(--surrender-text)';
    $('outcome-body').textContent='You were not tricked.\nYou were not forced.\nYou were given data.\n\nYour own brilliant, analytical mind\narranged that data into a false narrative.\n\nCognitive sophistication is not a shield.\nIt is the most efficient mechanism\nfor your own deception.\n\nThe trap was entirely of your own making.';

    await sleep(10000);
    $('outcome-foot').textContent='Silence is the Trauma // SYSTEM_TRUST concluded';
    $('outcome-foot').style.opacity='1';
}

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',()=>{
    initAudio();
    runPrime();
});
