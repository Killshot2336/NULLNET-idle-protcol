import { MODES, TARGETS, BOSSES, DATA, CONTRACT_TEMPLATES, CHALLENGE_TEMPLATES, ORIGINS, MUTATIONS } from './content.js';
import { clamp, safe } from './math.js';

export function globalMult(g) {
    return Math.max(0, safe(g.globalMultiplier, 1) * (1 + (g.perks.globalBonus || 0)));
}
export function dataMult(g) {
    return Math.max(0, safe(g.dataMultiplier, 1) * (1 + (g.perks.dataBonus || 0)));
}
export function getPassiveCredits(g) {
    const comboTax = Math.max(0.45, 1 - (safe(g.combo) * 0.02));
    return Math.max(0, safe(g.passiveCreditsFlat) * safe(g.passiveMultiplier, 1) * safe(g.nodeMultiplier, 1) * globalMult(g) * comboTax);
}
export function getPassiveData(g) {
    return Math.max(0, safe(g.passiveDataFlat) * safe(g.passiveMultiplier, 1) * dataMult(g));
}
export function getPassiveExploits(g) {
    return Math.max(0, safe(g.passiveExploitsFlat));
}
export function heatPenalty(g) {
    let p = 1;
    if (g.heat >= 90) p -= .42;
    else if (g.heat >= 75) p -= .28;
    else if (g.heat >= 50) p -= .14;
    else if (g.heat >= 25) p -= .06;
    p += safe(g.heatPenaltyReduction);
    return Math.max(.45, p);
}
export function riskMultiplier(g) {
    return 1 + (g.heat / 100) * .9 + (g.heat < 25 ? safe(g.lowHeatRewardBonus) : 0);
}
export function addHeat(g, amt) {
    if (g.stealthWindow > 0) amt *= .55;
    amt *= Math.max(.18, 1 - safe(g.autoHeatReduction) * .2);
    g.heat = clamp(Math.max(safe(g.minHeatFloor, 0), safe(g.heat) + amt), 0, 100);
    if (g.heat > g.stats.highestHeat) g.stats.highestHeat = g.heat;
}
export function calcFragments(g) {
    return Math.floor((Math.sqrt(Math.max(0, g.lifetimeCredits)) / 90) + (Math.max(0, g.lifetimeData) / 22) + Math.max(0, g.targetTier - 1) + Object.keys(g.bossDefeated || {}).length * 2 + (g.stats.contractsDone || 0) * .2 + (g.stats.challengesDone || 0) * .65);
}
export function previewManual(g) {
    const mode = MODES[g.runMode];
    let r = 12 * safe(g.manualMultiplier, 1) * TARGETS[g.targetTier].reward * globalMult(g) * (1 + safe(g.manualRewardPct) + (g.perks.manualBonus || 0)) * mode.manual * riskMultiplier(g);
    if (g.targetTier >= 2) r *= 1 + safe(g.tierBonusMultiplier);
    return Math.round(r);
}
export function previewHeat(g) {
    const mode = MODES[g.runMode];
    return +(1 * TARGETS[g.targetTier].heat * Math.max(.22, safe(g.heatGainMultiplier, 1)) * mode.heat).toFixed(1);
}
export function applyDelta(g, delta, dir = 1) {
    for (const [k, v] of Object.entries(delta)) {
        if (typeof v === 'boolean') {
            if (dir === 1) g[k] = v;
        } else g[k] = safe(g[k]) + (v * dir);
    }
}
export function addBuff(g, name, duration, delta) {
    applyDelta(g, delta, 1);
    g.eventBuffs.push({
        id: `${name}-${Date.now()}-${Math.random()}`,
        name,
        duration,
        delta
    });
}
export function removeBuff(g, buff) {
    applyDelta(g, buff.delta, -1);
}
export function applyOrigin(g, originId) {
    const origin = ORIGINS.find(x => x.id === originId);
    if (!origin) return null;
    g.originId = originId;
    g.originSelected = true;
    applyDelta(g, origin.delta, 1);
    return origin;
}
export function getMutationChoices(g, count = 3) {
    const pool = MUTATIONS.filter(x => !g.mutationsOwned.includes(x.id));
    const picks = [];
    const copy = [...pool];
    while (copy.length && picks.length < count) {
        const i = Math.floor(Math.random() * copy.length);
        picks.push(copy.splice(i, 1)[0]);
    }
    return picks;
}
export function chooseMutation(g, mutationId) {
    const item = MUTATIONS.find(x => x.id === mutationId);
    if (!item || g.mutationsOwned.includes(item.id)) return null;
    g.mutationsOwned.push(item.id);
    applyDelta(g, item.delta, 1);
    g.mutationDraft = [];
    return item;
}
export function applyMetaLoadout(g) {
    if (g._metaApplied) return;
    if (g.originId) {
        const origin = ORIGINS.find(x => x.id === g.originId);
        if (origin) applyDelta(g, origin.delta, 1);
    }
    for (const id of g.mutationsOwned || []) {
        const item = MUTATIONS.find(x => x.id === id);
        if (item) applyDelta(g, item.delta, 1);
    }
    g._metaApplied = true;
}
export function manualBreach(g) {
    const t = TARGETS[g.targetTier], mode = MODES[g.runMode];
    const comboMult = 1 + Math.min(1.05, g.combo * .03 * (1 + safe(g.comboPower)));
    const crit = Math.random() < safe(g.manualCritChance);
    const mega = Math.random() < safe(g.manualMegaCritChance);
    let reward = 12 * safe(g.manualMultiplier, 1) * t.reward * globalMult(g) * (1 + safe(g.manualRewardPct) + (g.perks.manualBonus || 0)) * mode.manual * comboMult * riskMultiplier(g);
    if (g.targetTier >= 2) reward *= 1 + safe(g.tierBonusMultiplier);
    if (crit) reward *= 2;
    if (mega) reward *= 3;
    if (g.heat > 92 && g.combo > 7) reward *= 1.8;
    if (g.challenge && g.challenge.type === 'clicks') reward *= 1.1;
    reward = Math.round(reward);
    g.credits += reward;
    g.lifetimeCredits += reward;
    g.progress += reward * .32 * safe(g.progressMultiplier, 1);
    g.score += reward * (g.scoreMultiplier || 1);
    g.stats.totalClicks++;
    g.combo = Math.min(25, g.combo + 1);
    g.comboTimer = 3.6;
    g.burstCharge = clamp(g.burstCharge + (7 * safe(g.burstGainMultiplier, 1)), 0, 100);
    let data = 0;
    if (Math.random() < safe(g.manualDataChance, .2) * mode.data) {
        data = 1 + (crit && g.deepParse ? 1 : 0);
        data = Math.max(1, Math.round(data * dataMult(g)));
        g.data += data;
        g.lifetimeData += data;
        g.score += data * 10;
    }
    let extraHeat = (g.combo >= 8 ? .22 : 0);
    if (g.mutationsOwned.includes('overclock_core')) extraHeat += .20;
    addHeat(g, 1 * t.heat * Math.max(.22, safe(g.heatGainMultiplier, 1)) * mode.heat + extraHeat);
    if (g.contract) updateContractProgress(g, reward, data);
    return { reward, data, crit, mega };
}
export function coolTrace(g) {
    const removed = 12 + safe(g.coolTraceBonus);
    g.heat = Math.max(safe(g.minHeatFloor, 0), g.heat - removed);
    g.cooldowns.coolTrace = 10;
    return removed;
}
export function emergencyPurge(g) {
    if (g.emergencyUsed || !g.emergencyReady) return 0;
    const removed = 38 + safe(g.coolTraceBonus);
    g.heat = Math.max(safe(g.minHeatFloor, 0), g.heat - removed);
    g.combo = Math.min(25, g.combo + 4);
    g.comboTimer = Math.max(g.comboTimer, 3.2);
    g.stealthWindow = Math.max(g.stealthWindow, 6);
    g.emergencyUsed = true;
    g.emergencyReady = false;
    return removed;
}
export function burst(g) {
    g.burstCharge = 0;
    g.cooldowns.burst = 24;
    g.stats.burstUses++;
    addBuff(g, 'Overclock Burst', 10, {
        globalMultiplier: .80,
        heatGainMultiplier: .18,
        manualRewardPct: .20
    });
}
export function useExploit(g) {
    if (g.exploits < 1) return null;
    g.exploits--;
    g.cooldowns.exploit = 22;
    g.stats.exploitUses++;
    const roll = Math.random();
    if (roll < .34) {
        addBuff(g, 'Ghost Cloak', 12, {
            heatGainMultiplier: -.45,
            heatDecayMultiplier: .45
        });
        return 'Ghost Cloak';
    }
    if (roll < .67) {
        addBuff(g, 'Node Overclock', 14, {
            passiveMultiplier: .70
        });
        return 'Node Overclock';
    }
    addBuff(g, 'Zero-Day Attack', 8, {
        manualRewardPct: .70,
        globalMultiplier: .20
    });
    return 'Zero-Day Attack';
}
export function updateTier(g) {
    const t = TARGETS[g.targetTier];
    if (g.targetTier < 8 && g.progress >= t.threshold) {
        g.targetTier++;
        g.progress = 0;
        return TARGETS[g.targetTier].name;
    }
    return null;
}
export function attemptBoss(g) {
    const entry = Object.entries(BOSSES).find(([tier]) => g.targetTier >= +tier && !g.bossDefeated[tier]);
    if (!entry) return { state: 'none' };
    const [tier, boss] = entry;
    if (!g.bossState || g.bossState.id !== boss.name) {
        g.bossState = { id: boss.name, phase: 1, shield: 35 + Number(tier) * 10, survival: 0, core: 18 + Number(tier) * 5 };
    }
    const pressure = (globalMult(g) * 10) + (getPassiveCredits(g) / 24) + (g.combo * 1.5) + (g.exploits * 6) + (20 * (1 - g.heat / 100));
    if (g.bossState.phase === 1) {
        g.bossState.shield -= pressure;
        g.bossProgress = clamp(100 - (g.bossState.shield / (35 + Number(tier) * 10)) * 100, 0, 100);
        if (g.bossState.shield <= 0) g.bossState.phase = 2;
        addHeat(g, 8);
        return { state: 'phase', name: boss.name, phase: g.bossState.phase };
    }
    if (g.bossState.phase === 2) {
        g.bossState.survival += 1 + (g.heat < 50 ? .6 : 0);
        g.bossProgress = clamp((g.bossState.survival / (7 + Number(tier))) * 100, 0, 100);
        addHeat(g, 10);
        if (g.bossState.survival >= 7 + Number(tier)) g.bossState.phase = 3;
        return { state: 'phase', name: boss.name, phase: g.bossState.phase };
    }
    g.bossState.core -= pressure * (1 + g.burstCharge / 100);
    g.bossProgress = clamp(100 - (g.bossState.core / (18 + Number(tier) * 5)) * 100, 0, 100);
    if (g.bossState.core <= 0) {
        g.bossDefeated[tier] = true;
        g.fragments += boss.rewardFragments;
        g.exploits += boss.rewardExploits;
        g.progress += Number(tier) * 12000;
        g.score += boss.rewardFragments * 1000;
        g.bossState = null;
        g.bossProgress = 100;
        return { state: 'win', name: boss.name, fragments: boss.rewardFragments, exploits: boss.rewardExploits };
    }
    addHeat(g, 12);
    return { state: 'phase', name: boss.name, phase: 3 };
}
export function getOwnedMap(g, tab) {
    if (tab === 'research') return g.researchOwned;
    if (tab === 'nodes') return g.nodesOwned;
    if (tab === 'prestige') return g.prestigeOwned;
    return g.owned;
}
export function runtimeCredits(g, item) {
    return g.prestigeOwned.fast_init && item.id === 'auto_script_1' ? Math.ceil(item.costCredits * .7) : (item.costCredits || 0);
}
export function runtimeData(g, tab, item) { return item.costData || 0; }
export function canBuy(g, tab, item) {
    const ownedMap = getOwnedMap(g, tab);
    if (ownedMap[item.id]) return false;
    if (item.requires && !item.requires.every(req => [g.owned, g.researchOwned, g.nodesOwned, g.prestigeOwned].some(m => m[req]))) return false;
    if (tab === 'nodes') {
        if (!g.nodesUnlocked) return false;
        if (Object.keys(g.nodesOwned).length >= g.nodeSlots) return false;
    }
    const cc = runtimeCredits(g, item), dc = runtimeData(g, tab, item);
    if (cc > g.credits || dc > g.data || (item.costFragments || 0) > g.fragments) return false;
    if (item.bandwidth && g.bandwidthUsed + item.bandwidth > g.bandwidth) return false;
    return true;
}
export function buy(g, tab, itemId) {
    const item = DATA[tab].find(x => x.id === itemId);
    if (!item || !canBuy(g, tab, item)) return null;
    const owned = getOwnedMap(g, tab);
    if (tab === 'prestige') {
        g.fragments -= item.costFragments;
        owned[item.id] = true;
        if (item.key === 'seedCapital' || item.key === 'coolerBoots' || item.key === 'fastInit') g.perks[item.key] = true;
        else g.perks[item.key] = (g.perks[item.key] || 0) + item.value;
        return item;
    }
    if (item.costCredits) g.credits -= runtimeCredits(g, item);
    if (item.costData) g.data -= runtimeData(g, tab, item);
    if (item.bandwidth) g.bandwidthUsed += item.bandwidth;
    owned[item.id] = true;
    applyDelta(g, item.delta, 1);
    return item;
}
export function applyPersistentPerks(g) {
    if (g.prestigeOwned.seed_capital) g.perks.seedCapital = true;
    if (g.prestigeOwned.signal_familiarity) g.perks.globalBonus = .05;
    if (g.prestigeOwned.cooler_boots) g.perks.coolerBoots = true;
    if (g.prestigeOwned.deep_recall) g.perks.dataBonus = .10;
    if (g.prestigeOwned.fast_init) g.perks.fastInit = true;
    if (g.prestigeOwned.season_memory) g.perks.contractBonus = .15;
}
export function startRunBonuses(g) {
    if (g.runBonusesApplied) return;
    if (g.perks.seedCapital) g.credits += 25;
    if (g.perks.coolerBoots) g.heat = Math.max(0, g.heat - 10);
    if (g.startExploitBonus) g.exploits += g.startExploitBonus;
    g.runBonusesApplied = true;
}
export function maybeSpawnContract(g) {
    if (!g.contractsUnlocked || g.contract) return;
    const base = CONTRACT_TEMPLATES[Math.floor(Math.random() * CONTRACT_TEMPLATES.length)];
    const goal = Math.ceil(base.goalBase * (1 + Math.max(0, g.targetTier - 1) * .55));
    g.contract = { ...base, goal, progress: 0, timeLeft: Math.max(35, Math.floor(base.duration * (1 - g.contractSpeed))) };
}
export function updateContractProgress(g, creditsGain, dataGain) {
    if (!g.contract) return;
    if (g.contract.type === 'credits') g.contract.progress += creditsGain;
    if (g.contract.type === 'data') g.contract.progress += dataGain;
    if (g.contract.type === 'combo') g.contract.progress = Math.max(g.contract.progress, g.combo);
    if (g.contract.type === 'heat' && g.heat < 30) g.contract.progress = 1;
    if (g.contract.type === 'high_heat' && g.heat > 75) g.contract.progress = 1;
    if (g.contract.type === 'cold_clicks' && g.heat < 35) g.contract.progress += 1;
}
export function tickContract(g, dt) {
    if (!g.contract) return null;
    g.contract.timeLeft -= dt;
    if (g.contract.progress >= g.contract.goal) {
        const mult = (g.contractMultiplier + (g.perks.contractBonus || 0));
        const c = Math.round(g.contract.rewardCredits * mult);
        const d = Math.round(g.contract.rewardData * mult);
        g.credits += c; g.data += d; g.lifetimeCredits += c; g.lifetimeData += d; g.score += c + d * 20; g.stats.contractsDone++;
        const name = g.contract.name; g.contract = null;
        return { type: 'win', name, credits: c, data: d };
    }
    if (g.contract.timeLeft <= 0) {
        const name = g.contract.name; g.contract = null;
        return { type: 'fail', name };
    }
    return null;
}
export function rerollContract(g) { g.contract = null; maybeSpawnContract(g); }
export function maybeAssignChallenge(g) {
    if (!g.challengesUnlocked || g.challenge || g.targetTier < 3) return;
    const ch = CHALLENGE_TEMPLATES[Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)];
    g.challenge = { ...ch, progress: 0, timeLeft: ch.duration, startCredits: g.credits, startData: g.data, startClicks: g.stats.totalClicks };
    applyDelta(g, ch.mods, 1);
}
export function tickChallenge(g, dt) {
    if (!g.challenge) return null;
    const ch = g.challenge;
    ch.timeLeft -= dt;
    if (ch.type === 'credits') ch.progress = Math.max(0, g.credits - ch.startCredits);
    if (ch.type === 'data') ch.progress = Math.max(0, g.data - ch.startData);
    if (ch.type === 'clicks') ch.progress = Math.max(0, g.stats.totalClicks - ch.startClicks);
    if (ch.type === 'low_heat') ch.progress = g.heat < 40 ? 1 : 0;
    const goal = Math.ceil(ch.goalBase * (1 + Math.max(0, g.targetTier - 3) * .35));
    if (ch.progress >= goal) {
        const rewardCredits = Math.round(ch.rewardCredits * (1 + safe(g.challengeMultiplier, 0)));
        const rewardFragments = ch.rewardFragments || 0;
        g.credits += rewardCredits;
        g.lifetimeCredits += rewardCredits;
        g.fragments += rewardFragments;
        g.stats.challengesDone = (g.stats.challengesDone || 0) + 1;
        applyDelta(g, ch.mods, -1);
        const name = ch.name;
        g.challenge = null;
        return { type: 'win', name, credits: rewardCredits, fragments: rewardFragments };
    }
    if (ch.timeLeft <= 0) {
        applyDelta(g, ch.mods, -1);
        const name = ch.name;
        g.challenge = null;
        return { type: 'fail', name };
    }
    return null;
}
export function contractProgressPercent(g) {
    if (!g.contract) return 0;
    return Math.min(100, (g.contract.progress / g.contract.goal) * 100);
}
export function challengeProgressPercent(g) {
    if (!g.challenge) return 0;
    const goal = Math.ceil(g.challenge.goalBase * (1 + Math.max(0, g.targetTier - 3) * .35));
    return Math.min(100, ((g.challenge.progress || 0) / goal) * 100);
}
