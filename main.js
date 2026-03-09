(() => {
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const els = {
  hud: document.getElementById('hud'),
  hpText: document.getElementById('hpText'),
  hpBar: document.getElementById('hpBar'),
  pulseText: document.getElementById('pulseText'),
  pulseBar: document.getElementById('pulseBar'),
  slashText: document.getElementById('slashText'),
  slashBar: document.getElementById('slashBar'),
  waveText: document.getElementById('waveText'),
  eventText: document.getElementById('eventText'),
  scoreText: document.getElementById('scoreText'),
  creditsText: document.getElementById('creditsText'),
  comboText: document.getElementById('comboText'),
  shieldText: document.getElementById('shieldText'),
  sectorText: document.getElementById('sectorText'),
  archetypeText: document.getElementById('archetypeText'),
  contractText: document.getElementById('contractText'),
  bossHud: document.getElementById('bossHud'),
  bossBar: document.getElementById('bossBar'),
  bossName: document.getElementById('bossName'),
  menu: document.getElementById('menu'),
  startBtn: document.getElementById('startBtn'),
  howBtn: document.getElementById('howBtn'),
  howPanel: document.getElementById('howPanel'),
  closeHow: document.getElementById('closeHow'),
  pauseOverlay: document.getElementById('pauseOverlay'),
  resumeBtn: document.getElementById('resumeBtn'),
  pauseMenuBtn: document.getElementById('pauseMenuBtn'),
  upgradeOverlay: document.getElementById('upgradeOverlay'),
  upgradeChoices: document.getElementById('upgradeChoices'),
  relicOverlay: document.getElementById('relicOverlay'),
  relicChoices: document.getElementById('relicChoices'),
  gameOverOverlay: document.getElementById('gameOverOverlay'),
  retryBtn: document.getElementById('retryBtn'),
  menuBtn: document.getElementById('menuBtn'),
  waveBanner: document.getElementById('waveBanner'),
  toast: document.getElementById('toast'),
  metaShop: document.getElementById('metaShop'),
  achievementList: document.getElementById('achievementList'),
  tabMeta: document.getElementById('tabMeta'),
  tabAchievements: document.getElementById('tabAchievements'),
  metaPanel: document.getElementById('metaPanel'),
  achievementPanel: document.getElementById('achievementPanel'),
  bestScore: document.getElementById('bestScore'),
  bankedCredits: document.getElementById('bankedCredits'),
  bestWave: document.getElementById('bestWave'),
  bossesTotal: document.getElementById('bossesTotal'),
  finalScore: document.getElementById('finalScore'),
  finalWave: document.getElementById('finalWave'),
  finalCredits: document.getElementById('finalCredits'),
  finalCombo: document.getElementById('finalCombo'),
  gameOverTitle: document.getElementById('gameOverTitle'),
  runSummary: document.getElementById('runSummary'),
  touchControls: document.getElementById('touchControls'),
  touchPad: document.getElementById('touchPad'),
  touchStick: document.getElementById('touchStick'),
  slashBtn: document.getElementById('slashBtn'),
  pulseBtn: document.getElementById('pulseBtn'),
  fpsTag: document.getElementById('fpsTag'),
};

const SAVE_KEY = 'voidline-rift-reaper-release-save-v6';
const VERSION = 6;
const LEGACY_KEYS = [
  'voidline-rift-reaper-release-save-v5',
  'voidline-rift-reaper-release-save-v4',
  'voidline-rift-reaper-release-save-v3',
  'voidline-rift-reaper-save-v1',
  'voidline-rift-reaper-brand-final-v1',
];

const metaDefs = [
  { id: 'hull', name: 'Core Hull', desc: '+12 max hull per rank.', base: 12, max: 5 },
  { id: 'cannon', name: 'Focus Lens', desc: '+8% base damage per rank.', base: 14, max: 5 },
  { id: 'drive', name: 'Gyro Drive', desc: '+5% move speed per rank.', base: 12, max: 5 },
  { id: 'pulse', name: 'Pulse Coil', desc: '+10% pulse gain per rank.', base: 14, max: 5 },
  { id: 'salvage', name: 'Salvage Cache', desc: '+2 starting credits per rank.', base: 8, max: 8 },
  { id: 'slash', name: 'Rift Chamber', desc: '+10% slash damage per rank.', base: 16, max: 5 },
];

const achieveDefs = [
  { id: 'first_blood', name: 'First Blood', desc: 'Destroy 1 enemy in a run.', check: r => r.kills >= 1 },
  { id: 'boss_contact', name: 'Boss Contact', desc: 'Reach wave 10.', check: r => r.wave >= 10 },
  { id: 'deep_run', name: 'Deep Run', desc: 'Reach wave 20.', check: r => r.wave >= 20 },
  { id: 'boss_breaker', name: 'Boss Breaker', desc: 'Defeat 3 bosses across runs.', check: (r,s) => s.totalBosses >= 3 },
  { id: 'flow_state', name: 'Flow State', desc: 'Reach a x3.0 combo.', check: r => r.maxCombo >= 3 },
  { id: 'rift_lord', name: 'Rift Lord', desc: 'Reach wave 30.', check: r => r.wave >= 30 },
];

const runUpgrades = [
  { id: 'damage', name: 'Overclock', tag: 'Offense', tags:['projectile'], desc: '+22% cannon damage.', apply: p => p.damage *= 1.22 },
  { id: 'fire', name: 'Rapid Relay', tag: 'Offense', tags:['projectile'], desc: '+14% fire rate.', apply: p => p.fireDelay *= 0.86 },
  { id: 'speed', name: 'Impulse Drive', tag: 'Mobility', tags:['slash'], desc: '+12% move speed.', apply: p => p.speed *= 1.12 },
  { id: 'pierce', name: 'Phase Rounds', tag: 'Control', tags:['projectile'], desc: '+1 projectile pierce.', apply: p => p.pierce += 1 },
  { id: 'spread', name: 'Prism Split', tag: 'Offense', tags:['projectile'], desc: 'Adds side shots.', apply: p => p.multiShot = Math.min(2, p.multiShot + 1) },
  { id: 'magnet', name: 'Magnet Sweep', tag: 'Utility', tags:['drone'], desc: 'Pull credits from farther away.', apply: p => p.magnet += 30 },
  { id: 'regen', name: 'Nano Repair', tag: 'Defense', tags:['drone'], desc: 'Regenerate 0.8 hull per second.', apply: p => p.regen += 0.8 },
  { id: 'pulse', name: 'Capacitor Banks', tag: 'Burst', tags:['energy'], desc: '+20% pulse gain.', apply: p => p.pulseGain *= 1.2 },
  { id: 'slashDmg', name: 'Rift Edge', tag: 'Slash', tags:['slash'], desc: '+35% Rift Slash damage.', apply: p => p.slashDamage *= 1.35 },
  { id: 'slashCd', name: 'Snap Release', tag: 'Slash', tags:['slash'], desc: '-18% Rift Slash cooldown.', apply: p => p.slashCooldown *= 0.82 },
  { id: 'credit', name: 'Golden Fracture', tag: 'Economy', tags:['drone'], desc: '+25% credit drops.', apply: p => p.creditBoost += .25 },
  { id: 'shield', name: 'Mirror Skin', tag: 'Defense', tags:['drone'], desc: 'Gain a 1-hit shield each wave.', apply: p => p.waveShield += 1 },
  { id: 'ricochet', name: 'Ricochet Core', tag: 'Control', tags:['projectile'], desc: 'Shots bounce to another enemy.', apply: p => p.ricochet += 1 },
  { id: 'chain', name: 'Arc Coil', tag: 'Burst', tags:['energy'], desc: 'Shots chain lightning on hit.', apply: p => p.chain += 1 },
  { id: 'drone', name: 'Halo Drone', tag: 'Utility', tags:['drone'], desc: 'Adds an orbit drone.', apply: p => p.droneCount = Math.min(3, p.droneCount + 1) },
  { id: 'nova', name: 'Aftershock', tag: 'Slash', tags:['slash'], desc: 'Rift Slash releases a close-range nova.', apply: p => p.slashNova += 1 },
  { id: 'surge', name: 'Storm Feed', tag: 'Burst', tags:['energy'], desc: 'Pulse hits harder and charges from kills.', apply: p => { p.pulseGain *= 1.15; p.pulseDamageBonus = (p.pulseDamageBonus || 0) + 10; } },
  { id: 'thruster', name: 'Phantom Thrusters', tag: 'Mobility', tags:['slash'], desc: 'Move speed and slash gain rise together.', apply: p => { p.speed *= 1.08; p.slashGain *= 1.18; } },
];

const events = ['Assault', 'Crossfire', 'Riftstorm', 'Bulwark', 'Low Gravity', 'Storm Field', 'Rift Fog', 'Magnetic Surge'];
const sectorNames = ['Sector I','Sector II','Sector III','Sector IV','Sector V'];
const bossDefs = [
  { name:'Rift Sovereign', family:'rift', color:'#ff72cb', core:'#ffd7ff' },
  { name:'Iron Maw', family:'maw', color:'#ff9966', core:'#ffe0a5' },
  { name:'Glass Widow', family:'widow', color:'#8de7ff', core:'#ffffff' },
  { name:'Static King', family:'static', color:'#ffe66e', core:'#fff7b8' },
  { name:'Hollow Engine', family:'engine', color:'#8fb4ff', core:'#ffffff' },
  { name:'Blood Prism', family:'prism', color:'#ff5e88', core:'#ffd5de' },
  { name:'Void Leviathan', family:'leviathan', color:'#8c7cff', core:'#d9d2ff' },
  { name:'Eclipse Seraph', family:'seraph', color:'#b39cff', core:'#fff3cf' },
  { name:'Null Warden', family:'warden', color:'#a4ffd0', core:'#effff7' },
  { name:'Storm Colossus', family:'colossus', color:'#73caff', core:'#f8fdff' },
];
const MOTHERSHIP = { name:'The Mother Ship', family:'mothership', color:'#ff4d6d', core:'#fff5f8' };
const archetypeDefs = { slash:{name:'Rift Blade'}, projectile:{name:'Void Gunner'}, energy:{name:'Storm Core'}, drone:{name:'Orbital Engineer'} };
const relicDefs = [
  { id:'redShift', name:'Red Shift Core', desc:'Infinite pierce, slower fire.', apply:p=>{p.pierce+=99; p.fireDelay*=1.18;} },
  { id:'blackPrism', name:'Black Prism', desc:'Massive crits and side shots.', apply:p=>{p.critChance+=.18; p.critDamage+=.75; p.multiShot=Math.max(p.multiShot,2);} },
  { id:'ghostReactor', name:'Ghost Reactor', desc:'Pulse primes itself when runs get ugly.', apply:p=>{p.autoPulse=true; p.pulseGain*=1.35; p.pulse=clamp(p.pulse+35,0,100);} },
  { id:'crackedHalo', name:'Cracked Halo', desc:'Permanent shield, lower max hull.', apply:p=>{p.waveShield+=1; p.maxHp*=.82; p.hp=Math.min(p.hp,p.maxHp);} },
  { id:'stormHeart', name:'Storm Heart', desc:'Chain lightning and stronger pulse.', apply:p=>{p.chain+=2; p.pulseGain*=1.25; p.pulseDamageBonus=(p.pulseDamageBonus||0)+18;} },
  { id:'seraphFeather', name:'Seraph Feather', desc:'Faster movement and slash, weaker bullets.', apply:p=>{p.speed*=1.18; p.slashCooldown*=.76; p.damage*=.9;} },
];
const contractDefs = [
  { id:'slash_kills', name:'Sever 12 targets with Rift Slash', reward:18, init:()=>({goal:12,progress:0}), progress:r=>r.contractData.progress||0, onSlashKill:r=>{r.contractData.progress=(r.contractData.progress||0)+1;} },
  { id:'perfect_wave', name:'Clear the next wave without taking damage', reward:20, init:()=>({goal:1,progress:0}), progress:r=>r.contractData.progress||0, onWaveEnd:r=>{ if(!r.tookDamageWave) r.contractData.progress=1; } },
  { id:'kill_elites', name:'Destroy 3 elite enemies', reward:22, init:()=>({goal:3,progress:0}), progress:r=>r.contractData.progress||0, onEliteKill:r=>{r.contractData.progress=(r.contractData.progress||0)+1;} },
  { id:'collect_credits', name:'Collect 35 credits', reward:16, init:r=>({goal:35,startCredits:r.credits}), progress:r=>Math.max(0,r.credits-(r.contractData.startCredits||0)) },
];
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const rand = (a,b) => Math.random() * (b-a) + a;
const dist = (ax, ay, bx, by) => Math.hypot(ax-bx, ay-by);
const lerp = (a,b,t) => a + (b-a)*t;
const shuffle = arr => { const a = [...arr]; for (let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; };
const roman = n => ['I','II','III','IV','V'][Math.max(0, Math.min(4, n-1))] || String(n);

const cg = {
  ready: false,
  async init() {
    try {
      if (window.CrazyGames?.SDK?.init) {
        await window.CrazyGames.SDK.init();
        this.ready = true;
      }
    } catch {}
  },
  gameplayStart() { try { window.CrazyGames?.SDK?.game?.gameplayStart?.(); } catch {} },
  gameplayStop() { try { window.CrazyGames?.SDK?.game?.gameplayStop?.(); } catch {} },
  happy() { try { window.CrazyGames?.SDK?.game?.happytime?.(); } catch {} },
};

const audio = {
  ctx: null, master: null, musicGain: null, nodes: [],
  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.09;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.03;
    this.musicGain.connect(this.master);
    this.startMusic();
  },
  tone(freq, dur=.08, type='triangle', vol=.12, slide=0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.linearRampToValueAtTime(freq + slide, t + dur);
    gain.gain.setValueAtTime(.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + .02);
  },
  noise(d=.07, vol=.12) {
    if (!this.ctx) return;
    const len = Math.floor(this.ctx.sampleRate * d);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const ch = buffer.getChannelData(0);
    for (let i=0;i<len;i++) ch[i] = (Math.random()*2-1) * (1 - i/len);
    const src = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    src.buffer = buffer;
    src.connect(gain);
    gain.connect(this.master);
    src.start();
  },
  ui(){ this.tone(600,.07,'triangle',.12,90); },
  shot(){ this.tone(760,.05,'triangle',.10,-200); },
  hit(){ this.tone(180,.08,'sawtooth',.09,-90); },
  kill(){ this.tone(220,.09,'square',.11,240); },
  pickup(){ this.tone(900,.05,'triangle',.08,120); },
  pulse(){ this.noise(.12,.18); this.tone(120,.22,'sawtooth',.12,780); },
  slash(){ this.noise(.08,.16); this.tone(420,.1,'triangle',.14,-150); },
  boss(){ this.tone(140,.2,'square',.12,10); },
  startMusic() {
    if (!this.ctx || this.nodes.length) return;
    const now = this.ctx.currentTime + 0.05;
    const notes = [110, 146.83, 130.81, 164.81];
    for (let i = 0; i < 2; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(notes[0] * (i === 0 ? 1 : 2), now);
      notes.forEach((n, idx) => {
        const t = now + idx * 1.5;
        osc.frequency.linearRampToValueAtTime(n * (i === 0 ? 1 : 2), t);
      });
      osc.frequency.linearRampToValueAtTime(notes[0] * (i === 0 ? 1 : 2), now + notes.length * 1.5);
      gain.gain.value = i === 0 ? 0.12 : 0.05;
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      this.nodes.push(osc);
    }
  }
};

const state = {
  mode: 'menu',
  paused: false,
  mobile: matchMedia('(pointer: coarse)').matches,
  keys: {},
  pointer: { x: 0, y: 0 },
  touch: { active: false, x: 0, y: 0, id: null },
  stars: [],
  particles: [],
  flashes: [],
  bullets: [],
  enemyBullets: [],
  enemies: [],
  drops: [],
  drones: [],
  slashes: [],
  texts: [],
  shake: 0,
  bannerTimer: 0,
  toastTimer: 0,
  bossIntro: 0,
  freezeTimer: 0,
  save: null,
  run: null,
  targetLock: null,
  fps: { show: false, frame: 0, time: 0, value: 0 },
};

function normalizeSave(raw) {
  return {
    version: VERSION,
    credits: raw?.credits || 0,
    bestScore: raw?.bestScore || 0,
    bestWave: raw?.bestWave || 0,
    totalBosses: raw?.totalBosses || 0,
    achievements: raw?.achievements || {},
    meta: raw?.meta || {},
  };
}
function loadSave() {
  let found = null;
  for (const key of [SAVE_KEY, ...LEGACY_KEYS]) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) { found = JSON.parse(raw); break; }
    } catch {}
  }
  return normalizeSave(found);
}
function persist() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state.save));
}
function resize() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  if (!state.stars.length) {
    for (let i = 0; i < 180; i++) state.stars.push({ x: rand(0, innerWidth), y: rand(0, innerHeight), s: rand(.5, 2.4), v: rand(6, 22), layer: i < 90 ? 1 : i < 145 ? 2 : 3, tw: rand(0, Math.PI * 2) });
  }
  els.touchControls?.classList.toggle('hidden', !(state.mobile && state.mode === 'game'));
}

function makePlayer() {
  const m = state.save.meta;
  return {
    x: innerWidth / 2, y: innerHeight / 2,
    r: 15,
    speed: 270 * (1 + (m.drive || 0) * .05),
    maxHp: 108 + (m.hull || 0) * 12,
    hp: 108 + (m.hull || 0) * 12,
    damage: 18 * (1 + (m.cannon || 0) * .08),
    fireDelay: .17, fireTimer: 0, bulletSpeed: 760,
    pierce: 0, multiShot: 0,
    pulse: 0, pulseGain: 1 * (1 + (m.pulse || 0) * .10),
    slash: 30, slashGain: 1, slashCooldown: 2.85, slashTimer: 0, slashDamage: 88 * (1 + (m.slash || 0) * .10), slashNova: 0,
    magnet: 80, critChance: 0.08, critDamage: 0.5, regen: 0, creditBoost: 0,
    waveShield: 0, shieldLeft: 0,
    ricochet: 0, chain: 0, droneCount: 0, iframes: 0, autoPulse: false, pulseDamageBonus: 0,
    target: null, targetLock: 0,
  };
}

function refreshMetaUi() {
  els.bestScore.textContent = state.save.bestScore.toLocaleString();
  els.bankedCredits.textContent = state.save.credits.toLocaleString();
  els.bestWave.textContent = state.save.bestWave;
  els.bossesTotal.textContent = state.save.totalBosses;
  renderMetaShop();
  renderAchievements();
}

function assignContract(initial=false) {
  if (!state.run) return;
  const def = contractDefs[(Math.random() * contractDefs.length) | 0];
  state.run.contract = def;
  state.run.contractData = def.init(state.run);
  state.run.contractComplete = false;
  if (!initial) toast(`Contract • ${def.name}`);
}
function maybeCheckContract() {
  const r = state.run;
  if (!r || !r.contract || r.contractComplete) return;
  const progress = r.contract.progress(r);
  if (progress >= r.contractData.goal) {
    r.contractComplete = true;
    r.credits += r.contract.reward;
    r.earnedCredits += r.contract.reward;
    r.score += r.contract.reward * 18;
    r.player.pulse = clamp(r.player.pulse + 25, 0, 100);
    toast(`Contract complete +${r.contract.reward}`);
  }
}
function applyRunUpgrade(up) {
  up.apply(state.run.player);
  for (const t of (up.tags || [])) state.run.tagCounts[t] = (state.run.tagCounts[t] || 0) + 1;
  let best = null, bestValue = 0;
  for (const [k,v] of Object.entries(state.run.tagCounts)) if (v > bestValue) { best = k; bestValue = v; }
  if (best && bestValue >= 3) state.run.archetype = best;
}
function openRelicChoices() {
  state.mode = 'relic';
  els.relicOverlay.classList.remove('hidden');
  state.paused = true;
  const picks = shuffle(relicDefs).slice(0, 3);
  els.relicChoices.innerHTML = '';
  for (const relic of picks) {
    const card = document.createElement('button');
    card.className = 'upgrade-card btn';
    card.innerHTML = `<div class="tag">Relic</div><h3>${relic.name}</h3><p>${relic.desc}</p>`;
    card.addEventListener('click', () => {
      audio.ui();
      relic.apply(state.run.player);
      state.run.relics.push(relic.id);
      els.relicOverlay.classList.add('hidden');
      state.mode = 'game';
      state.paused = false;
      startNextWave();
    });
    els.relicChoices.appendChild(card);
  }
}
function applyElite(e) {
  e.elite = true;
  const mod = ['overcharged','armored','volatile','frenzied'][(Math.random() * 4) | 0];
  e.eliteMod = mod;
  if (mod === 'overcharged') { e.speed *= 1.18; e.color = '#ffe66e'; e.value += 4; }
  if (mod === 'armored') { e.hp *= 1.45; e.maxHp = e.hp; e.r += 2; e.color = '#b8d7ff'; e.value += 5; }
  if (mod === 'volatile') { e.explosive = true; e.color = '#ff8a6b'; e.value += 5; }
  if (mod === 'frenzied') { e.speed *= 1.26; e.color = '#ff78d2'; e.value += 6; }
}

function renderMetaShop() {
  els.metaShop.innerHTML = '';
  for (const up of metaDefs) {
    const level = state.save.meta[up.id] || 0;
    const cost = level >= up.max ? null : Math.round(up.base * Math.pow(1.55, level));
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="list-head">
        <div><h3>${up.name}</h3><p>${up.desc}</p></div>
        <div class="badge">${level}/${up.max}</div>
      </div>
      <div class="row-between">
        <span class="mini">${cost === null ? 'Maxed' : `${cost} credits`}</span>
        <button class="btn ${cost !== null && state.save.credits >= cost ? 'primary' : ''}" ${cost === null || state.save.credits < cost ? 'disabled' : ''}>${cost === null ? 'Complete' : 'Buy'}</button>
      </div>`;
    const btn = item.querySelector('button');
    btn.addEventListener('click', () => {
      if (cost === null || state.save.credits < cost) return;
      audio.ui();
      state.save.credits -= cost;
      state.save.meta[up.id] = level + 1;
      persist();
      refreshMetaUi();
    });
    els.metaShop.appendChild(item);
  }
}
function renderAchievements() {
  els.achievementList.innerHTML = '';
  for (const a of achieveDefs) {
    const done = !!state.save.achievements[a.id];
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="list-head">
        <div><h3>${a.name}</h3><p>${a.desc}</p></div>
        <div class="badge ${done ? '' : 'locked'}">${done ? 'Unlocked' : 'Locked'}</div>
      </div>`;
    els.achievementList.appendChild(item);
  }
}
function setHomeTab(tab) {
  const upgrades = tab === 'upgrades';
  els.tabMeta.classList.toggle('active', upgrades);
  els.tabAchievements.classList.toggle('active', !upgrades);
  els.tabMeta.setAttribute('aria-selected', upgrades ? 'true' : 'false');
  els.tabAchievements.setAttribute('aria-selected', upgrades ? 'false' : 'true');
  els.metaPanel.classList.toggle('active', upgrades);
  els.achievementPanel.classList.toggle('active', !upgrades);
}
function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  state.toastTimer = 1.5;
}
function banner(msg) {
  els.waveBanner.textContent = msg;
  els.waveBanner.classList.remove('hidden');
  state.bannerTimer = 1.45;
}
function awardAchievement(id) {
  if (state.save.achievements[id]) return;
  state.save.achievements[id] = true;
  persist();
  const found = achieveDefs.find(a => a.id === id);
  if (found) toast(`Milestone unlocked: ${found.name}`);
  renderAchievements();
}
function checkAchievements() {
  const r = state.run;
  for (const a of achieveDefs) if (!state.save.achievements[a.id] && a.check(r, state.save)) awardAchievement(a.id);
}

function makeEnemy(type, x, y, wave) {
  const base = 1 + wave * 0.11;
  const e = { type, x, y, vx: 0, vy: 0, t: 0, hit: 0, shot: rand(.7, 1.6), mine: 1.7 };
  if (type === 'chaser') return { ...e, hp: 28 * base, maxHp: 28 * base, speed: 90 + wave * 6, r: 12, value: 4, color: '#79f4ff' };
  if (type === 'charger') return { ...e, hp: 22 * base, maxHp: 22 * base, speed: 120 + wave * 8, r: 10, value: 5, color: '#ffb365', charge: 0 };
  if (type === 'sniper') return { ...e, hp: 24 * base, maxHp: 24 * base, speed: 52 + wave * 3, r: 11, value: 6, color: '#ff78d2' };
  if (type === 'orbiter') return { ...e, hp: 30 * base, maxHp: 30 * base, speed: 76 + wave * 5, r: 12, value: 6, color: '#a98aff', orbit: rand(0, Math.PI * 2) };
  if (type === 'splitter') return { ...e, hp: 34 * base, maxHp: 34 * base, speed: 70 + wave * 5, r: 14, value: 7, color: '#82ffb8' };
  if (type === 'kamikaze') return { ...e, hp: 20 * base, maxHp: 20 * base, speed: 138 + wave * 8, r: 10, value: 5, color: '#ff5e7c' };
  if (type === 'miner') return { ...e, hp: 40 * base, maxHp: 40 * base, speed: 60 + wave * 4, r: 14, value: 7, color: '#ffd770' };
  if (type === 'tank') return { ...e, hp: 62 * base, maxHp: 62 * base, speed: 48 + wave * 4, r: 18, value: 8, color: '#9fc0ff' };
  return { ...e, hp: 18 * base, maxHp: 18 * base, speed: 0, r: 10, value: 3, color: '#ffd36e', fuse: 1.8 + rand(0,.8) };
}
function makeBoss(def, wave) {
  const finalBoss = def.family === 'mothership';
  return {
    type: 'boss', name: def.name, family: def.family, x: innerWidth/2, y: 120, vx: 0, vy: 0,
    hp: finalBoss ? 5400 : 520 + wave * 95, maxHp: finalBoss ? 5400 : 520 + wave * 95,
    speed: finalBoss ? 54 : 70 + wave * 0.18, r: finalBoss ? 92 : 40, value: finalBoss ? 550 : 70,
    phase: 1, shot: finalBoss ? .85 : .95, t: 0, color: def.color, core: def.core, finalBoss, dashTimer: 1.35,
  };
}
function startRun() {
  audio.ensure();
  cg.gameplayStart();
  state.mode = 'game';
  state.paused = false;
  els.menu.classList.add('hidden');
  els.howPanel.classList.add('hidden');
  els.pauseOverlay.classList.add('hidden');
  els.gameOverOverlay.classList.add('hidden');
  els.upgradeOverlay.classList.add('hidden');
  if (els.relicOverlay) els.relicOverlay.classList.add('hidden');
  els.hud.classList.remove('hidden');
  resize();

  state.run = {
    player: makePlayer(),
    wave: 0, score: 0, credits: (state.save.meta.salvage || 0) * 2, earnedCredits: 0,
    kills: 0, bosses: 0, maxCombo: 1, combo: 1, comboTimer: 0, perfectWaves: 0,
    tookDamageWave: false, event: 'Assault', enemiesToSpawn: 0, spawnTimer: 0, inBossWave: false,
    targetLock: null, targetLockTime: 0, sector: 1, archetype: null, tagCounts: { slash:0, projectile:0, energy:0, drone:0 },
    bossOrder: shuffle(bossDefs), bossIndex: 0, relics: [], contract: null, contractData: {}, contractComplete: false,
  };
  state.bullets = []; state.enemyBullets = []; state.enemies = []; state.drops = []; state.particles = [];
  state.flashes = []; state.texts = []; state.slashes = []; state.drones = []; state.shake = 0;
  state.freezeTimer = 0; state.bossIntro = 0;
  startNextWave();
  syncHud();
}
function showMenu() {
  cg.gameplayStop();
  state.mode = 'menu';
  state.paused = false;
  state.run = null;
  els.menu.classList.remove('hidden');
  els.hud.classList.add('hidden');
  els.bossHud.classList.add('hidden');
  els.pauseOverlay.classList.add('hidden');
  els.gameOverOverlay.classList.add('hidden');
  els.upgradeOverlay.classList.add('hidden');
  if (els.relicOverlay) els.relicOverlay.classList.add('hidden');
  els.touchControls.classList.add('hidden');
  refreshMetaUi();
  setHomeTab('upgrades');
}
function endRun(victory=false) {
  const r = state.run; if (!r) return;
  cg.gameplayStop();
  state.mode = 'gameover';
  state.save.credits += r.earnedCredits;
  state.save.bestScore = Math.max(state.save.bestScore, Math.floor(r.score));
  state.save.bestWave = Math.max(state.save.bestWave, r.wave);
  state.save.totalBosses += r.bosses;
  persist();
  checkAchievements();
  refreshMetaUi();
  els.finalScore.textContent = Math.floor(r.score).toLocaleString();
  els.finalWave.textContent = r.wave;
  els.finalCredits.textContent = r.earnedCredits.toLocaleString();
  els.finalCombo.textContent = `x${r.maxCombo.toFixed(1)}`;
  els.gameOverTitle.textContent = victory ? 'Protocol Complete' : 'Rift Collapse';
  els.runSummary.innerHTML = `
    <div>Enemies defeated: <strong>${r.kills}</strong></div>
    <div>Bosses defeated: <strong>${r.bosses}</strong></div>
    <div>Perfect waves: <strong>${r.perfectWaves}</strong></div>
    <div>Combat rating: <strong>${combatRating(r)}</strong></div>`;
  els.gameOverOverlay.classList.remove('hidden');
  els.bossHud.classList.add('hidden');
  els.hud.classList.add('hidden');
  els.touchControls.classList.add('hidden');
}
function combatRating(r) {
  const value = r.score * 0.002 + r.wave * 4 + r.maxCombo * 12 + r.perfectWaves * 6;
  if (value >= 90) return 'S';
  if (value >= 70) return 'A';
  if (value >= 50) return 'B';
  if (value >= 35) return 'C';
  return 'D';
}
function startNextWave() {
  const r = state.run; if (!r) return;
  r.wave += 1;
  r.sector = Math.min(5, Math.floor((r.wave - 1) / 200) + 1);
  r.tookDamageWave = false;
  r.player.shieldLeft = r.player.waveShield;
  r.inBossWave = r.wave % 10 === 0;
  if (!r.inBossWave && r.wave % 5 === 1) assignContract(false);
  if (r.inBossWave) {
    r.event = r.wave === 1000 ? 'Mother Ship' : 'Boss';
    r.currentBossName = r.wave === 1000 ? MOTHERSHIP.name : (r.bossOrder[r.bossIndex % r.bossOrder.length]?.name || 'Boss');
    r.enemiesToSpawn = 1;
    r.spawnTimer = .42;
    state.bossIntro = 1.5;
    state.freezeTimer = 1.15;
    const nextBoss = r.wave === 1000 ? MOTHERSHIP : r.bossOrder[r.bossIndex % r.bossOrder.length];
    banner(`${r.wave === 1000 ? 'Final Signal' : 'Boss Wave'} • ${nextBoss.name}`);
    audio.boss();
  } else {
    r.event = events[(r.wave - 1) % events.length];
    const eventBonus = r.event === 'Riftstorm' ? 3 : r.event === 'Bulwark' ? 2 : r.event === 'Crossfire' ? 1 : 0;
    r.enemiesToSpawn = 8 + Math.floor(r.wave * 1.75) + eventBonus + Math.floor(r.sector * 1.2);
    r.spawnTimer = 0.42;
    banner(r.wave % 10 === 9 ? `Wave ${r.wave} • Warning: Boss Signal Rising` : `Wave ${r.wave} • ${r.event}`);
    audio.ui();
  }
  syncHud();
}
function spawnEnemy() {
  const r = state.run;
  if (r.inBossWave) {
    if (r.wave === 1000) {
      r.currentBossName = MOTHERSHIP.name;
      state.enemies.push(makeBoss(MOTHERSHIP, r.wave));
    } else {
      if (r.bossIndex > 0 && r.bossIndex % bossDefs.length === 0) r.bossOrder = shuffle(bossDefs);
      const def = r.bossOrder[r.bossIndex % bossDefs.length];
      r.currentBossName = def.name;
      state.enemies.push(makeBoss(def, r.wave));
      r.bossIndex += 1;
    }
    els.bossHud.classList.remove('hidden');
    return;
  }
  const margin = 120;
  const side = (Math.random() * 4) | 0;
  let x, y;
  if (side === 0) { x = rand(-margin, innerWidth + margin); y = -margin; }
  else if (side === 1) { x = innerWidth + margin; y = rand(-margin, innerHeight + margin); }
  else if (side === 2) { x = rand(-margin, innerWidth + margin); y = innerHeight + margin; }
  else { x = -margin; y = rand(-margin, innerHeight + margin); }
  const wave = r.wave;
  const pool = ['chaser','charger','sniper'];
  if (wave >= 12) pool.push('orbiter');
  if (wave >= 20) pool.push('splitter');
  if (wave >= 30) pool.push('kamikaze');
  if (wave >= 40) pool.push('miner');
  if (wave >= 50) pool.push('tank');
  if (r.event === 'Crossfire') pool.push('sniper','sniper');
  if (r.event === 'Bulwark') pool.push('tank');
  if (r.event === 'Riftstorm') pool.push('orbiter','splitter');
  const e = makeEnemy(pool[(Math.random()*pool.length)|0], x, y, wave);
  if (wave >= 15 && Math.random() < Math.min(0.28, 0.05 + wave * 0.0012)) applyElite(e);
  state.enemies.push(e);
}

function getMoveVector() {
  let x = 0, y = 0;
  if (state.keys.KeyA || state.keys.ArrowLeft) x -= 1;
  if (state.keys.KeyD || state.keys.ArrowRight) x += 1;
  if (state.keys.KeyW || state.keys.ArrowUp) y -= 1;
  if (state.keys.KeyS || state.keys.ArrowDown) y += 1;
  if (state.touch.active) { x += state.touch.x; y += state.touch.y; }
  const m = Math.hypot(x, y) || 1;
  return { x: x / m, y: y / m };
}
function bestTarget() {
  const r = state.run, p = r.player;
  if (r.targetLock && r.targetLockTime > 0 && state.enemies.includes(r.targetLock)) {
    r.targetLockTime -= 1/60;
    return r.targetLock;
  }
  let best = null, score = Infinity;
  for (const e of state.enemies) {
    const d = dist(p.x, p.y, e.x, e.y);
    const front = Math.abs(Math.atan2(e.y - p.y, e.x - p.x) - p.facing || 0);
    const value = d - (e.type === 'boss' ? 220 : 0) + front * 30;
    if (value < score) { score = value; best = e; }
  }
  r.targetLock = best;
  r.targetLockTime = best ? 0.18 : 0;
  return best;
}
function shootAtNearest() {
  const r = state.run, p = r.player;
  const target = bestTarget();
  if (!target) return;
  const ang = Math.atan2(target.y - p.y, target.x - p.x);
  p.facing = ang;
  const shots = [{ a: ang, s: 1, off: 0 }];
  if (p.multiShot >= 1) shots.push({ a: ang - .18, s: .78, off: -8 }, { a: ang + .18, s: .78, off: 8 });
  if (p.multiShot >= 2) shots.push({ a: ang - .34, s: .68, off: -14 }, { a: ang + .34, s: .68, off: 14 });
  for (const s of shots) {
    state.bullets.push({
      x: p.x + Math.cos(s.a + Math.PI / 2) * s.off,
      y: p.y + Math.sin(s.a + Math.PI / 2) * s.off,
      vx: Math.cos(s.a) * p.bulletSpeed,
      vy: Math.sin(s.a) * p.bulletSpeed,
      dmg: p.damage * s.s, r: 4, pierce: p.pierce, ricochet: p.ricochet, chain: p.chain
    });
  }
  p.fireTimer = p.fireDelay;
  audio.shot();
}

function updateDrones(dt) {
  const r = state.run, p = r.player;
  while (state.drones.length < p.droneCount) state.drones.push({ angle: rand(0, Math.PI * 2), fire: rand(.1, .4) });
  state.drones.length = p.droneCount;
  for (let i = 0; i < state.drones.length; i++) {
    const d = state.drones[i];
    d.angle += dt * (1.5 + i * .2);
    d.fire -= dt;
    if (d.fire <= 0) {
      const dx = p.x + Math.cos(d.angle) * 42;
      const dy = p.y + Math.sin(d.angle) * 42;
      const target = nearestEnemy(dx, dy, 420);
      if (target) {
        const a = Math.atan2(target.y - dy, target.x - dx);
        state.bullets.push({ x: dx, y: dy, vx: Math.cos(a) * 620, vy: Math.sin(a) * 620, dmg: p.damage * .55, r: 3, pierce: 0, ricochet: 0, chain: 0 });
      }
      d.fire = .52;
    }
  }
}
function nearestEnemy(x, y, maxD=9999, exclude=null) {
  let best = null, bestD = maxD;
  for (const e of state.enemies) {
    if (e === exclude) continue;
    const d = dist(x, y, e.x, e.y);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
}
function chainFrom(origin, dmg, chains) {
  let current = origin;
  const used = new Set([origin]);
  for (let c = 0; c < chains; c++) {
    const next = nearestEnemy(current.x, current.y, 170, current);
    if (!next || used.has(next)) break;
    used.add(next);
    state.flashes.push({ x1: current.x, y1: current.y, x2: next.x, y2: next.y, life: .08 });
    hitEnemy(next, dmg, false);
    current = next;
  }
}
function hitEnemy(e, dmg, slash) {
  const p = state.run.player;
  const crit = Math.random() < p.critChance;
  const total = dmg * (crit ? (1 + p.critDamage) : 1);
  e.hp -= total;
  e.hit = .08;
  if (crit) floatingText(e.x, e.y, 'CRIT', '#ffd36e');
  burst(e.x, e.y, e.type === 'boss' ? 10 : 6, e.color);
  audio.hit();
  if (e.hp <= 0) {
    const idx = state.enemies.indexOf(e);
    if (idx >= 0) killEnemy(idx, slash);
  }
}
function killEnemy(index, slash) {
  const e = state.enemies[index];
  if (!e) return;
  state.enemies.splice(index,1);
  const r = state.run;
  r.kills += 1;
  if (slash && r.contract?.onSlashKill) r.contract.onSlashKill(r);
  r.score += Math.floor(e.value * 18 * r.combo);
  r.combo = Math.min(5, r.combo + (e.type === 'boss' ? .45 : .16));
  r.comboTimer = 2.4;
  r.maxCombo = Math.max(r.maxCombo, r.combo);
  r.player.pulse = clamp(r.player.pulse + e.value * 1.8 * r.player.pulseGain, 0, 100);
  r.player.slash = clamp(r.player.slash + e.value * 1.4 * r.player.pulseGain, 0, 100);
  const credits = Math.max(1, Math.round(e.value * (1 + r.player.creditBoost)));
  state.drops.push({ x: e.x, y: e.y, value: credits, vx: rand(-40,40), vy: rand(-40,40), life: 8 });
  floatingText(e.x, e.y, `+${Math.floor(e.value * 18)}`, '#eef4ff');
  burst(e.x, e.y, e.type === 'boss' ? 26 : 14, e.color);
  audio.kill();
  state.shake = Math.max(state.shake, e.type === 'boss' ? .8 : .14);
  if (slash) state.freezeTimer = Math.max(state.freezeTimer, .025);
  if (e.type === 'splitter') {
    for (let i = 0; i < 2; i++) state.enemies.push({ ...makeEnemy('chaser', e.x + rand(-16,16), e.y + rand(-16,16), Math.max(1, r.wave - 1)), r: 8, hp: 12, maxHp: 12, value: 2, color: '#8cffc0' });
  }
  if (e.type === 'boss') {
    r.bosses += 1;
    els.bossHud.classList.add('hidden');
    toast('Boss defeated');
    cg.happy();
  }
}
function burst(x, y, count, color) {
  const cap = 260;
  for (let i = 0; i < count && state.particles.length < cap; i++) {
    const a = rand(0, Math.PI * 2), speed = rand(40, 250);
    state.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: rand(.18, .65), color, s: rand(1.5, 4.5) });
  }
}
function floatingText(x, y, text, color) {
  if (state.texts.length > 40) state.texts.shift();
  state.texts.push({ x, y, text, color, life: .65 });
}
function explode(x, y, radius, dmg, color) {
  state.flashes.push({ x, y, radius, life: .22, color });
  burst(x, y, 22, color);
  for (const e of [...state.enemies]) if (dist(x, y, e.x, e.y) <= radius + e.r) hitEnemy(e, dmg, false);
}
function damagePlayer(amount) {
  const p = state.run.player;
  if (p.iframes > 0 || state.mode !== 'game') return;
  if (p.shieldLeft > 0) {
    p.shieldLeft -= 1;
    p.iframes = .22;
    toast('Shield blocked hit');
    return;
  }
  p.hp -= amount;
  p.iframes = .45;
  state.run.tookDamageWave = true;
  state.run.combo = 1;
  state.run.comboTimer = 0;
  state.shake = Math.max(state.shake, .35);
  state.flashes.push({ x: p.x, y: p.y, radius: 54, life: .18, color: '#ff658d' });
  if (p.hp <= 0) endRun(false);
}
function usePulse() {
  if (state.mode !== 'game' || state.paused) return;
  const p = state.run.player;
  if (p.pulse < 100) return;
  p.pulse = 0;
  audio.pulse();
  state.shake = .8;
  explode(p.x, p.y, 182, 48, '#8ad8ff');
}
function pointSegDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const l2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = clamp(t, 0, 1);
  const x = x1 + t * dx, y = y1 + t * dy;
  return dist(px, py, x, y);
}
function useSlash() {
  if (state.mode !== 'game' || state.paused) return;
  const p = state.run.player;
  if (p.slashTimer > 0 || p.slash < 100) return;
  const aimX = state.pointer.x || p.x + Math.cos(p.facing), aimY = state.pointer.y || p.y + Math.sin(p.facing);
  const a = Math.atan2(aimY - p.y, aimX - p.x);
  const dash = 180;
  const sx = p.x, sy = p.y;
  p.x = clamp(p.x + Math.cos(a) * dash, 20, innerWidth - 20);
  p.y = clamp(p.y + Math.sin(a) * dash, 20, innerHeight - 20);
  p.slash = 0;
  p.slashTimer = p.slashCooldown;
  p.iframes = .22;
  state.slashes.push({ x1: sx, y1: sy, x2: p.x, y2: p.y, life: .18, color: '#ff6fd8' });
  state.shake = .55;
  audio.slash();
  let hits = 0;
  for (const e of [...state.enemies]) {
    const d = pointSegDist(e.x, e.y, sx, sy, p.x, p.y);
    if (d <= e.r + 28) { hits += 1; hitEnemy(e, p.slashDamage, true); }
  }
  if (p.slashNova) explode(p.x, p.y, 82, 22 + p.slashNova * 8, '#ff89e2');
  if (hits) state.freezeTimer = Math.max(state.freezeTimer, .05);
}
function updateBullets(dt) {
  const margin = 80;
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (state.run?.event === 'Magnetic Surge') { const n = nearestEnemy(b.x, b.y, 180); if (n) { const s = Math.hypot(b.vx,b.vy); const aa = Math.atan2(n.y - b.y, n.x - b.x); b.vx = lerp(b.vx, Math.cos(aa) * s, dt * 2.2); b.vy = lerp(b.vy, Math.sin(aa) * s, dt * 2.2); } }
    if (b.x < -margin || b.x > innerWidth + margin || b.y < -margin || b.y > innerHeight + margin) { state.bullets.splice(i,1); continue; }
    for (let j = state.enemies.length - 1; j >= 0; j--) {
      const e = state.enemies[j];
      if (dist(b.x, b.y, e.x, e.y) <= e.r + b.r) {
        hitEnemy(e, b.dmg, false);
        if (b.chain > 0) chainFrom(e, b.dmg * .55, b.chain);
        if (b.pierce > 0) { b.pierce -= 1; b.dmg *= .86; }
        else if (b.ricochet > 0) {
          const next = nearestEnemy(e.x, e.y, 220, e);
          if (next) {
            const a = Math.atan2(next.y - e.y, next.x - e.x);
            b.x = e.x; b.y = e.y; b.vx = Math.cos(a) * 760; b.vy = Math.sin(a) * 760; b.ricochet -= 1; b.dmg *= .82;
          } else { state.bullets.splice(i,1); }
        } else {
          state.bullets.splice(i,1);
        }
        break;
      }
    }
  }
}
function updateEnemyBullets(dt) {
  const margin = 80;
  for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
    const b = state.enemyBullets[i];
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (state.run?.event === 'Magnetic Surge') { const n = nearestEnemy(b.x, b.y, 180); if (n) { const s = Math.hypot(b.vx,b.vy); const aa = Math.atan2(n.y - b.y, n.x - b.x); b.vx = lerp(b.vx, Math.cos(aa) * s, dt * 2.2); b.vy = lerp(b.vy, Math.sin(aa) * s, dt * 2.2); } } b.life -= dt;
    if (b.life <= 0 || b.x < -margin || b.x > innerWidth + margin || b.y < -margin || b.y > innerHeight + margin) { state.enemyBullets.splice(i,1); continue; }
    if (dist(b.x, b.y, state.run.player.x, state.run.player.y) <= state.run.player.r + b.r) {
      damagePlayer(b.dmg);
      state.enemyBullets.splice(i,1);
    }
  }
}
function radialShots(e, count, speed, dmg) {
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count + e.t * .18;
    state.enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 4.2, r: 5, dmg });
  }
}
function spawnAdds(count) {
  for (let i = 0; i < count; i++) state.enemies.push(makeEnemy(['chaser','charger','sniper','orbiter'][(Math.random()*4)|0], rand(80, innerWidth-80), rand(80, innerHeight/2), state.run.wave));
}
function shootEnemy(e, speed, dmg) {
  const p = state.run.player;
  const a = Math.atan2(p.y - e.y, p.x - e.x);
  state.enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 4.2, r: 5, dmg });
}
function updateBoss(e, dt) {
  const p = state.run.player;
  const hpRatio = e.hp / e.maxHp;
  const previousPhase = e.phase;
  e.phase = hpRatio < .34 ? 3 : hpRatio < .67 ? 2 : 1;
  if (e.phase !== previousPhase) { state.freezeTimer = .32; state.shake = .6; banner(`${e.name} • Phase ${e.phase}`); }
  e.t += dt;
  const a = Math.atan2(p.y - e.y, p.x - e.x);
  if (e.finalBoss) {
    e.x = lerp(e.x, innerWidth / 2 + Math.cos(e.t * .45) * 120, dt * .7);
    e.y = lerp(e.y, 150 + Math.sin(e.t * .6) * 60, dt * .7);
    e.shot -= dt;
    if (e.shot < 0.22 && e.shot > 0.18) state.flashes.push({ x: e.x, y: e.y, radius: e.r + 28, life: .12, color: 'rgba(255,240,180,0.9)' });
  if (e.shot <= 0) {
      radialShots(e, e.phase === 1 ? 12 : e.phase === 2 ? 18 : 24, e.phase === 3 ? 280 : 220, e.phase === 3 ? 11 : 8);
      if (e.phase >= 2) spawnAdds(2 + e.phase);
      e.shot = e.phase === 3 ? .55 : e.phase === 2 ? .9 : 1.2;
    }
    return;
  }
  if (e.family === 'maw') {
    e.dashTimer -= dt; e.x += Math.cos(a) * e.speed * dt * .6; e.y += Math.sin(a) * e.speed * dt * .6;
    if (e.dashTimer <= 0) { e.vx = Math.cos(a) * (e.phase===3?380:280); e.vy = Math.sin(a) * (e.phase===3?380:280); e.dashTimer = e.phase===3?.7:1.2; }
  } else {
    e.x = lerp(e.x, innerWidth / 2 + Math.sin(e.t * (.7 + e.phase*.08)) * (e.finalBoss ? 120 : 220), dt * (e.finalBoss ? .7 : 1.2));
    e.y = lerp(e.y, 120 + Math.cos(e.t * (1.1 + e.phase*.12)) * (e.finalBoss ? 60 : 42), dt * 1.1);
  }
  e.x += e.vx * dt; e.y += e.vy * dt; e.vx *= .92; e.vy *= .92;
  e.shot -= dt;
  if (e.shot <= 0) {
    if (e.family === 'rift') radialShots(e, e.phase===3?16:10, e.phase===3?260:210, e.phase===3?8:6);
    else if (e.family === 'widow') { for (let i=-2;i<=2;i+=2) state.enemyBullets.push({ x:e.x,y:e.y,vx:Math.cos(a+i*.08)*320,vy:Math.sin(a+i*.08)*320,life:4.2,r:4,dmg:7 }); }
    else if (e.family === 'static') radialShots(e, e.phase===3?20:12, 180+e.phase*20, 6+e.phase);
    else if (e.family === 'engine') { radialShots(e, 8+e.phase*2, 190+e.phase*25, 7); spawnAdds(e.phase); }
    else if (e.family === 'leviathan') { spawnAdds(1+e.phase); for (let i=-1;i<=1;i++) shootEnemy({x:e.x,y:e.y}, 240+i*25, 8); }
    else if (e.family === 'warden') radialShots(e, 10+e.phase*2, 170+e.phase*20, 6+e.phase);
    else radialShots(e, 12+e.phase*2, 210+e.phase*20, 7+e.phase);
    e.shot = e.phase === 3 ? .65 : e.phase === 2 ? .9 : 1.2;
    state.shake = Math.max(state.shake,.25);
  }
}
function updateEnemies(dt) {
  const p = state.run.player;
  const r = state.run;
  if (r.enemiesToSpawn > 0) {
    r.spawnTimer -= dt;
    if (r.spawnTimer <= 0) {
      spawnEnemy();
      r.enemiesToSpawn -= 1;
      const base = Math.max(.16, .42 - Math.min(.18, r.wave * .008));
      r.spawnTimer = r.inBossWave ? 99 : base;
    }
  }
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    e.t += dt; e.hit = Math.max(0, e.hit - dt);
    if (e.type === 'boss') { updateBoss(e, dt); continue; }
    const dx = p.x - e.x, dy = p.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    if (e.type === 'chaser' || e.type === 'tank' || e.type === 'splitter') {
      e.x += dx / d * e.speed * dt; e.y += dy / d * e.speed * dt;
    } else if (e.type === 'charger') {
      e.charge -= dt;
      const mult = e.charge <= 0 ? 2.2 : 1;
      if (e.charge <= -.45) e.charge = rand(1.2, 2.2);
      e.x += dx / d * e.speed * mult * dt; e.y += dy / d * e.speed * mult * dt;
    } else if (e.type === 'sniper') {
      if (d > 260) { e.x += dx / d * e.speed * dt; e.y += dy / d * e.speed * dt; }
      else if (d < 180) { e.x -= dx / d * e.speed * dt; e.y -= dy / d * e.speed * dt; }
      e.shot -= dt;
      if (e.shot <= 0) { shootEnemy(e, 220 + r.wave * 4, 6 + Math.floor(r.wave * .2)); e.shot = Math.max(.6, 1.35 - r.wave * .03); }
    } else if (e.type === 'orbiter') {
      e.orbit += dt * 1.55;
      const tx = p.x + Math.cos(e.orbit) * 140;
      const ty = p.y + Math.sin(e.orbit) * 140;
      const odx = tx - e.x, ody = ty - e.y, od = Math.hypot(odx, ody) || 1;
      e.x += odx / od * e.speed * dt; e.y += ody / od * e.speed * dt;
    } else if (e.type === 'kamikaze') {
      e.x += dx / d * e.speed * 1.5 * dt; e.y += dy / d * e.speed * 1.5 * dt;
    } else if (e.type === 'miner') {
      e.x += dx / d * e.speed * dt; e.y += dy / d * e.speed * dt;
      e.mine -= dt;
      if (e.mine <= 0) {
        state.enemies.push(makeEnemy('mine', e.x, e.y, r.wave));
        e.mine = rand(1.6, 2.4);
      }
    } else if (e.type === 'mine') {
      e.fuse -= dt;
      if (e.fuse <= 0) {
        explode(e.x, e.y, 88, 18, '#ffd36e');
        if (dist(e.x, e.y, p.x, p.y) <= 88) damagePlayer(18);
        state.enemies.splice(i, 1);
        continue;
      }
    }
    if (e.type !== 'sniper' && e.type !== 'mine' && dist(e.x, e.y, p.x, p.y) < e.r + p.r) {
      damagePlayer(e.type === 'kamikaze' ? 16 : e.type === 'tank' ? 14 : 10);
      if (e.type === 'kamikaze') {
        explode(e.x, e.y, 70, 20, e.color);
        state.enemies.splice(i, 1);
      }
    }
  }
}
function updateDrops(dt) {
  const p = state.run.player;
  for (let i = state.drops.length - 1; i >= 0; i--) {
    const d = state.drops[i];
    d.life -= dt;
    d.vx *= .986; d.vy *= .986;
    d.x += d.vx * dt; d.y += d.vy * dt;
    const dd = dist(d.x, d.y, p.x, p.y);
    if (dd < p.magnet) {
      const a = Math.atan2(p.y - d.y, p.x - d.x);
      d.vx += Math.cos(a) * 280 * dt; d.vy += Math.sin(a) * 280 * dt;
    }
    if (dd < p.r + 8) {
      state.run.credits += d.value;
      state.run.earnedCredits += d.value;
      state.run.score += d.value * 6;
      state.run.player.pulse = clamp(state.run.player.pulse + d.value * 1.2 * p.pulseGain, 0, 100);
      audio.pickup();
      state.drops.splice(i, 1);
    } else if (d.life <= 0) state.drops.splice(i, 1);
  }
}
function updateParticles(dt) {
  const particleCap = 260;
  if (state.particles.length > particleCap) state.particles.splice(0, state.particles.length - particleCap);
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; p.vx *= .985; p.vy *= .985;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
  for (let i = state.texts.length - 1; i >= 0; i--) {
    const t = state.texts[i];
    t.y -= 30 * dt; t.life -= dt;
    if (t.life <= 0) state.texts.splice(i, 1);
  }
  for (let i = state.flashes.length - 1; i >= 0; i--) {
    state.flashes[i].life -= dt;
    if (state.flashes[i].life <= 0) state.flashes.splice(i, 1);
  }
  for (let i = state.slashes.length - 1; i >= 0; i--) {
    state.slashes[i].life -= dt;
    if (state.slashes[i].life <= 0) state.slashes.splice(i, 1);
  }
  if (state.toastTimer > 0) {
    state.toastTimer -= dt;
    if (state.toastTimer <= 0) els.toast.classList.remove('show');
  }
  if (state.bannerTimer > 0) {
    state.bannerTimer -= dt;
    if (state.bannerTimer <= 0) els.waveBanner.classList.add('hidden');
  }
  state.shake = Math.max(0, state.shake - dt * 4);
}
function updateCombo(dt) {
  const r = state.run;
  if (r.combo > 1) {
    r.comboTimer -= dt;
    if (r.comboTimer <= 0) r.combo = Math.max(1, r.combo - dt * 0.85);
  }
}
function openUpgradeChoices() {
  state.mode = 'upgrade';
  els.upgradeOverlay.classList.remove('hidden');
  state.paused = true;
  const pool = [...runUpgrades];
  const picks = [];
  while (picks.length < 3 && pool.length) {
    const idx = (Math.random() * pool.length) | 0;
    picks.push(pool.splice(idx,1)[0]);
  }
  els.upgradeChoices.innerHTML = '';
  for (const up of picks) {
    const card = document.createElement('button');
    card.className = 'upgrade-card btn';
    card.innerHTML = `<div class="tag">${up.tag}</div><h3>${up.name}</h3><p>${up.desc}</p>`;
    card.addEventListener('click', () => {
      audio.ui();
      applyRunUpgrade(up);
      els.upgradeOverlay.classList.add('hidden');
      state.mode = 'game';
      state.paused = false;
      startNextWave();
    });
    els.upgradeChoices.appendChild(card);
  }
}
function syncHud() {
  if (!state.run) return;
  const p = state.run.player;
  els.hpText.textContent = `${Math.ceil(p.hp)} / ${Math.ceil(p.maxHp)}`;
  els.hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;
  els.pulseText.textContent = p.pulse >= 100 ? 'Ready' : `${Math.floor(p.pulse)}%`;
  els.pulseBar.style.width = `${p.pulse}%`;
  els.slashText.textContent = p.slashTimer > 0 ? `${p.slashTimer.toFixed(1)}s` : (p.slash >= 100 ? 'Ready' : `${Math.floor(p.slash)}%`);
  els.slashBar.style.width = `${p.slashTimer > 0 ? ((p.slashCooldown - p.slashTimer) / p.slashCooldown) * 100 : p.slash}%`;
  els.waveText.textContent = state.run.wave;
  els.eventText.textContent = state.run.event;
  els.scoreText.textContent = Math.floor(state.run.score).toLocaleString();
  els.creditsText.textContent = state.run.credits.toLocaleString();
  els.comboText.textContent = `x${state.run.combo.toFixed(1)}`;
  els.shieldText.textContent = p.shieldLeft;
  const boss = state.enemies.find(e => e.type === 'boss');
  els.bossHud.classList.toggle('hidden', !boss);
  if (boss) {
    els.bossName.textContent = boss.name;
    els.bossBar.style.width = `${(boss.hp / boss.maxHp) * 100}%`;
  }
}
function update(dt) {
  state.fps.frame += 1; state.fps.time += dt;
  if (state.fps.time >= .5) {
    state.fps.value = Math.round(state.fps.frame / state.fps.time);
    state.fps.frame = 0; state.fps.time = 0;
    if (state.fps.show && els.fpsTag) els.fpsTag.textContent = `FPS ${state.fps.value}`;
  }
  for (const s of state.stars) { s.y += s.v * dt; if (s.y > innerHeight + 2) { s.y = -2; s.x = rand(0, innerWidth); } }
  updateParticles(dt);
  if (state.mode !== 'game' || state.paused || !state.run) return;
  if (state.bossIntro > 0) state.bossIntro -= dt;
  if (state.freezeTimer > 0) { state.freezeTimer = Math.max(0, state.freezeTimer - dt); syncHud(); return; }
  const r = state.run, p = r.player;
  p.iframes = Math.max(0, p.iframes - dt);
  p.fireTimer -= dt;
  p.slashTimer = Math.max(0, p.slashTimer - dt);
  p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);
  p.slash = clamp(p.slash + dt * 8.5 * p.slashGain, 0, 100);
  if (p.autoPulse && p.hp < p.maxHp * .35) p.pulse = clamp(p.pulse + dt * 40, 0, 100);
  if (r.event === 'Storm Field' && Math.random() < dt * 0.65) { const ex = rand(60, innerWidth-60), ey = rand(60, innerHeight-60); state.flashes.push({ x: ex, y: ey, radius: 44, life: .18, color: '#fff07a' }); for (const e of state.enemies) if (dist(ex, ey, e.x, e.y) < 44 + e.r) hitEnemy(e, 18 + r.wave * .12, false); if (dist(ex, ey, p.x, p.y) < 50) damagePlayer(8); }

  const m = getMoveVector();
  const moveMul = r.event === 'Low Gravity' ? 1.14 : 1;
  p.x = clamp(p.x + m.x * p.speed * moveMul * dt, 20, innerWidth - 20);
  p.y = clamp(p.y + m.y * p.speed * moveMul * dt, 20, innerHeight - 20);

  updateDrones(dt);
  if (p.fireTimer <= 0) shootAtNearest();
  updateBullets(dt);
  updateEnemyBullets(dt);
  updateEnemies(dt);
  updateDrops(dt);
  updateCombo(dt);

  if (!r.enemiesToSpawn && !state.enemies.length && state.mode === 'game') {
    if (!r.tookDamageWave) r.perfectWaves += 1;
    if (r.contract?.onWaveEnd) r.contract.onWaveEnd(r);
    maybeCheckContract();
    if (r.inBossWave) { cg.happy(); if (r.wave >= 1000) endRun(true); else openRelicChoices(); }
    else openUpgradeChoices();
  }
  checkAchievements();
  syncHud();
}
function drawBackground() {
  const sector = state.run?.sector || 1;
  const sectorCores = [['rgba(32,68,116,0.18)','rgba(10,22,42,0.1)'],['rgba(90,40,116,0.20)','rgba(24,10,42,0.12)'],['rgba(32,116,105,0.18)','rgba(8,30,34,0.12)'],['rgba(116,56,40,0.18)','rgba(36,18,10,0.12)'],['rgba(140,30,50,0.22)','rgba(30,8,12,0.14)']][sector-1];
  const grd = ctx.createRadialGradient(innerWidth / 2, innerHeight / 2, 120, innerWidth / 2, innerHeight / 2, innerWidth * 0.82);
  grd.addColorStop(0, sectorCores[0]);
  grd.addColorStop(0.45, sectorCores[1]);
  grd.addColorStop(1, 'rgba(5, 10, 18, 0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  for (const s of state.stars) {
    s.y += (s.v * (s.layer * 0.35)) / 60;
    s.tw += 0.01 * s.layer;
    if (s.y > innerHeight + 4) { s.y = -4; s.x = rand(0, innerWidth); }
    const a = 0.22 + Math.sin(s.tw) * 0.12 + s.layer * 0.05;
    ctx.fillStyle = `rgba(${s.layer === 3 ? '255,230,180' : '125,235,255'},${Math.max(0.08, a)})`;
    ctx.fillRect(s.x, s.y, s.s + s.layer * 0.2, s.s + s.layer * 0.2);
  }

  const cell = 46;
  const offset = (performance.now() * 0.018) % cell;
  ctx.strokeStyle = 'rgba(115,242,255,0.055)';
  ctx.lineWidth = 1;
  for (let x = -cell; x < innerWidth + cell; x += cell) { ctx.beginPath(); ctx.moveTo(x + offset, 0); ctx.lineTo(x + offset, innerHeight); ctx.stroke(); }
  for (let y = -cell; y < innerHeight + cell; y += cell) { ctx.beginPath(); ctx.moveTo(0, y + offset); ctx.lineTo(innerWidth, y + offset); ctx.stroke(); }

  const rift = ctx.createRadialGradient(innerWidth * 0.72, innerHeight * 0.24, 0, innerWidth * 0.72, innerHeight * 0.24, innerWidth * 0.22);
  rift.addColorStop(0, 'rgba(189,127,255,0.18)');
  rift.addColorStop(0.35, 'rgba(115,240,255,0.08)');
  rift.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rift;
  ctx.fillRect(0,0,innerWidth,innerHeight);

  if (state.run?.event === 'Rift Fog') {
    ctx.fillStyle = 'rgba(10,14,20,0.22)';
    ctx.fillRect(0,0,innerWidth,innerHeight);
  }
  if (state.run?.event === 'Magnetic Surge') {
    ctx.strokeStyle = 'rgba(255,211,110,0.08)';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(innerWidth * (0.25 + i * 0.18), 0);
      ctx.bezierCurveTo(innerWidth * (0.34 + i * 0.16), innerHeight * 0.25, innerWidth * (0.18 + i * 0.12), innerHeight * 0.7, innerWidth * (0.36 + i * 0.16), innerHeight);
      ctx.stroke();
    }
  }
}
function drawPlayer() {
  const p = state.run.player;
  const thrustPulse = 0.7 + Math.sin(performance.now() * 0.02) * 0.18;
  for (let i = 0; i < 4; i++) {
    const len = 18 + thrustPulse * 14 + i * 3;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(115,242,255,${0.16 - i * 0.03})`;
    ctx.lineWidth = 10 - i * 2;
    ctx.moveTo(p.x, p.y + 8);
    ctx.lineTo(p.x, p.y + len);
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.facing + Math.PI / 2);
  ctx.globalAlpha = p.iframes > 0 ? 0.55 + Math.sin(performance.now() * 0.03) * 0.25 : 1;
  ctx.beginPath();
  ctx.fillStyle = '#081224';
  ctx.moveTo(0, -20); ctx.lineTo(14, 14); ctx.lineTo(0, 8); ctx.lineTo(-14, 14); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle = '#73f2ff';
  ctx.lineWidth = 2.5;
  ctx.moveTo(0, -17); ctx.lineTo(10, 10); ctx.lineTo(0, 4); ctx.lineTo(-10, 10); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.fillStyle = '#ffffff'; ctx.arc(0, -1, 5.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.fillStyle = 'rgba(115,242,255,0.25)'; ctx.arc(0, -1, 13, 0, Math.PI * 2); ctx.fill();
  if (p.shieldLeft > 0) { ctx.beginPath(); ctx.strokeStyle = 'rgba(255,238,180,0.9)'; ctx.lineWidth = 3; ctx.arc(0, 0, p.r + 10 + Math.sin(performance.now()*0.01)*1.5, 0, Math.PI * 2); ctx.stroke(); }
  if (p.slash >= 100 && p.slashTimer <= 0) {
    ctx.beginPath(); ctx.strokeStyle = `rgba(255,127,216,${0.42 + Math.sin(performance.now()*0.02)*0.2})`; ctx.lineWidth = 5; ctx.arc(0, 0, p.r + 15, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.strokeStyle = 'rgba(255,200,240,0.35)'; ctx.lineWidth = 1.5; ctx.arc(0, 0, p.r + 21 + Math.sin(performance.now()*0.012)*2, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  for (const d of state.drones) {
    const x = p.x + Math.cos(d.angle) * 42, y = p.y + Math.sin(d.angle) * 42;
    ctx.beginPath(); ctx.fillStyle = 'rgba(180,220,255,0.95)'; ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = 'rgba(115,242,255,0.4)'; ctx.arc(x, y, 9 + Math.sin(performance.now()*0.01 + d.angle)*1.5, 0, Math.PI * 2); ctx.stroke();
  }
}
function drawEnemies() {
  for (const e of state.enemies) {
    ctx.save();
    ctx.translate(e.x, e.y);
    if (e.type === 'orbiter' || e.type === 'boss') ctx.rotate(e.t * 1.2 + e.x * 0.01);
    ctx.fillStyle = e.hit > 0 ? '#ffffff' : e.color;
    ctx.strokeStyle = 'rgba(255,255,255,0.24)';
    ctx.lineWidth = e.type === 'boss' ? 4 : 2;
    if (e.type === 'boss') { if (e.family === 'widow') star(8, e.r, e.r*0.46); else if (e.family === 'maw') roundedPoly(3, e.r+4, 0.18); else if (e.family === 'static') star(6, e.r, e.r*0.42); else if (e.family === 'engine') roundedPoly(6, e.r, 0.08); else if (e.family === 'prism') roundedPoly(3, e.r+2, 0.04); else if (e.family === 'leviathan') roundedPoly(5, e.r, 0.18); else if (e.family === 'seraph') star(5, e.r, e.r*0.55); else if (e.family === 'warden') roundedPoly(7, e.r, 0.05); else if (e.family === 'colossus') roundedPoly(6, e.r+5, 0.12); else if (e.family === 'mothership') roundedPoly(8, e.r, 0.08); else star(6, e.r, e.r * 0.55); }
    else if (e.type === 'tank') roundedPoly(6, e.r, 0.14);
    else if (e.type === 'sniper') star(4, e.r, e.r * 0.45);
    else if (e.type === 'orbiter') roundedPoly(5, e.r, 0.2);
    else if (e.type === 'kamikaze') star(3, e.r, e.r * 0.42);
    else roundedPoly(3, e.r, 0.1);
    ctx.fill(); ctx.stroke();
    if (e.type === 'boss') { ctx.beginPath(); ctx.fillStyle = e.core || '#fff'; ctx.arc(0,0, Math.max(6, e.r * 0.22), 0, Math.PI * 2); ctx.fill(); }
    if (e.elite) { ctx.beginPath(); ctx.strokeStyle = 'rgba(255,240,150,0.9)'; ctx.lineWidth = 2; ctx.arc(0,0, e.r + 6 + Math.sin((e.t||0)*6) * 2, 0, Math.PI * 2); ctx.stroke(); }
    if (e.type === 'mine') {
      ctx.beginPath(); ctx.strokeStyle = 'rgba(255,214,107,0.32)'; ctx.lineWidth = 4; ctx.arc(0,0, e.r + 6 + Math.sin(e.fuse * 8)*2, 0, Math.PI*2); ctx.stroke();
    }
    if (e.hp < e.maxHp && e.type !== 'mine') {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(-e.r, e.r + 8, e.r * 2, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-e.r, e.r + 8, (e.hp / e.maxHp) * e.r * 2, 4);
    }
    ctx.restore();
  }
}
function roundedPoly(points, radius, wobble) {
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const a = (Math.PI * 2 * i) / points - Math.PI / 2;
    const r = radius * (1 + Math.sin(i * 3.7 + performance.now()*0.0015) * wobble);
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
function star(points, outer, inner) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
function drawBullets() {
  for (const b of state.bullets) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(115,242,255,0.26)';
    ctx.lineWidth = 3;
    ctx.moveTo(b.x - b.vx * 0.018, b.y - b.vy * 0.018);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.beginPath(); ctx.fillStyle = '#8afbff'; ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
  }
  for (const b of state.enemyBullets) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,217,170,0.22)';
    ctx.lineWidth = 3;
    ctx.moveTo(b.x - b.vx * 0.02, b.y - b.vy * 0.02);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.beginPath(); ctx.fillStyle = '#ffd9aa'; ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
  }
}
function drawDrops() {
  for (const d of state.drops) {
    ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(performance.now()*0.006 + d.x * 0.02); ctx.fillStyle = '#ffd66b'; star(4, 6, 3); ctx.fill(); ctx.restore();
  }
}
function drawParticles() {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life * 1.4);
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
    ctx.fill();
    if (p.s > 2.5) {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.arc(p.x, p.y, p.s * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  for (const t of state.texts) { ctx.globalAlpha = Math.max(0, t.life * 1.4); ctx.fillStyle = t.color; ctx.font = '800 16px Inter, sans-serif'; ctx.fillText(String(t.text), t.x, t.y); ctx.globalAlpha = 1; }
  for (const f of state.flashes) {
    if ('x1' in f) {
      ctx.globalAlpha = f.life * 8;
      ctx.strokeStyle = '#9ecbff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke(); ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = f.life * 3.2; ctx.strokeStyle = f.color; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(f.x, f.y, (f.radius || 54) * (1 - f.life), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = f.life * 1.6; ctx.fillStyle = f.color.startsWith('rgba') ? f.color.replace(/,[^)]+\)$/, ',0.08)') : f.color; ctx.beginPath(); ctx.arc(f.x, f.y, (f.radius || 54) * (0.35 + (1 - f.life) * 0.45), 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }
  }
  for (const fx of state.slashes) {
    const alpha = fx.life / .18;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(226,197,255,${alpha * .95})`; ctx.lineWidth = 34 * alpha; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(fx.x1, fx.y1); ctx.lineTo(fx.x2, fx.y2); ctx.stroke();
    ctx.strokeStyle = `rgba(115,242,255,${alpha * .55})`; ctx.lineWidth = 12 * alpha; ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${alpha * .3})`; ctx.lineWidth = 2 * alpha; ctx.stroke();
    ctx.restore();
  }
}
function render() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  drawBackground();
  if (state.mode === 'game' || state.mode === 'gameover' || state.mode === 'upgrade') {
    ctx.save();
    const sx = state.shake ? rand(-state.shake*24, state.shake*24) : 0;
    const sy = state.shake ? rand(-state.shake*24, state.shake*24) : 0;
    ctx.translate(sx, sy);
    drawDrops(); drawBullets(); drawEnemies(); if (state.run) drawPlayer(); drawParticles();
    ctx.restore();
    if (state.run?.player) {
      const hpRatio = state.run.player.hp / state.run.player.maxHp;
      if (hpRatio < 0.32) {
        const danger = 1 - hpRatio / 0.32;
        const vignette = ctx.createRadialGradient(innerWidth / 2, innerHeight / 2, innerHeight * 0.16, innerWidth / 2, innerHeight / 2, innerWidth * 0.66);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, `rgba(255,30,70,${0.12 + danger * 0.2})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0,0,innerWidth,innerHeight);
      }
    }
    if (state.bossIntro > 0 && state.run?.inBossWave) {
      const a = Math.min(1, state.bossIntro / 1.25);
      const bossName = state.run.wave === 1000 ? MOTHERSHIP.name : state.run.currentBossName || 'Boss';
      ctx.save();
      ctx.fillStyle = `rgba(4,7,14,${0.45 * a})`; ctx.fillRect(0,0,innerWidth,innerHeight);
      ctx.textAlign = 'center'; ctx.font = '800 18px Inter, sans-serif'; ctx.fillStyle = `rgba(255,214,107,${a})`;
      ctx.fillText(state.run.wave === 1000 ? 'FINAL CONTACT' : 'BOSS CONTACT', innerWidth / 2, innerHeight * 0.33);
      ctx.font = '900 46px Inter, sans-serif'; ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillText(bossName, innerWidth / 2, innerHeight * 0.4);
      ctx.font = '600 18px Inter, sans-serif'; ctx.fillStyle = `rgba(180,195,220,${a})`;
      ctx.fillText(state.run.wave === 1000 ? 'The signal ends here.' : 'Break the pattern. Stay aggressive.', innerWidth / 2, innerHeight * 0.45);
      ctx.restore();
    }
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function pauseGame(force) {
  if (state.mode !== 'game') return;
  state.paused = force ?? !state.paused;
  els.pauseOverlay.classList.toggle('hidden', !state.paused);
}
window.addEventListener('keydown', (e) => {
  state.keys[e.code] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  if (e.code === 'Space') usePulse();
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') useSlash();
  if (e.code === 'KeyP' || e.code === 'Escape') pauseGame();
  if (e.code === 'F3') {
    e.preventDefault();
    state.fps.show = !state.fps.show;
    els.fpsTag?.classList.toggle('hidden', !state.fps.show);
  }
});
window.addEventListener('keyup', (e) => { state.keys[e.code] = false; });
window.addEventListener('mousemove', (e) => { state.pointer.x = e.clientX; state.pointer.y = e.clientY; });
window.addEventListener('blur', () => { if (state.mode === 'game') pauseGame(true); Object.keys(state.keys).forEach(k => state.keys[k] = false); });
document.addEventListener('visibilitychange', () => { if (document.hidden && state.mode === 'game') pauseGame(true); });
function setStick(clientX, clientY) {
  const rect = els.touchPad.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let dx = clientX - cx, dy = clientY - cy;
  const len = Math.hypot(dx, dy), max = rect.width * .24;
  if (len > max) { dx = dx / len * max; dy = dy / len * max; }
  els.touchStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  state.touch.x = dx / max; state.touch.y = dy / max; state.touch.active = true;
}
function resetStick() {
  state.touch.active = false; state.touch.x = 0; state.touch.y = 0; state.touch.id = null;
  els.touchStick.style.transform = 'translate(-50%, -50%)';
}
els.touchPad?.addEventListener('pointerdown', (e) => { state.touch.id = e.pointerId; els.touchPad.setPointerCapture(e.pointerId); setStick(e.clientX, e.clientY); });
els.touchPad?.addEventListener('pointermove', (e) => { if (state.touch.id === e.pointerId) setStick(e.clientX, e.clientY); });
els.touchPad?.addEventListener('pointerup', resetStick);
els.touchPad?.addEventListener('pointercancel', resetStick);
els.pulseBtn?.addEventListener('click', usePulse);
els.slashBtn?.addEventListener('click', useSlash);

els.startBtn?.addEventListener('click', () => { audio.ensure(); audio.ui(); startRun(); });
els.retryBtn?.addEventListener('click', () => { audio.ui(); startRun(); });
els.menuBtn?.addEventListener('click', () => { audio.ui(); showMenu(); });
els.pauseMenuBtn?.addEventListener('click', () => { audio.ui(); showMenu(); });
els.resumeBtn?.addEventListener('click', () => { audio.ui(); pauseGame(false); });
els.howBtn?.addEventListener('click', () => { audio.ui(); els.howPanel?.classList.remove('hidden'); });
els.closeHow?.addEventListener('click', () => { audio.ui(); els.howPanel?.classList.add('hidden'); });
els.tabMeta?.addEventListener('click', () => { audio.ui(); setHomeTab('upgrades'); });
els.tabAchievements?.addEventListener('click', () => { audio.ui(); setHomeTab('milestones'); });

(async function boot() {
  resize();
  await cg.init();
  state.save = loadSave();
  refreshMetaUi();
  setHomeTab('upgrades');
  showMenu();
  requestAnimationFrame(loop);
})();
})();
