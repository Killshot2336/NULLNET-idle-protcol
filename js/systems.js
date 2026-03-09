import {
    MODES,
    TARGETS,
    BOSSES,
    DATA,
    CONTRACT_TEMPLATES,
    CHALLENGE_TEMPLATES
} from './content.js';
import {
    clamp,
    safe
} from './math.js';
export function globalMult(g) {
    return Math.max(0, safe(g.globalMultiplier, 1) * (1 + (g.perks.globalBonus || 0)));
}
export function dataMult(g) {
    return Math.max(0, safe(g.dataMultiplier, 1) * (1 + (g.perks.dataBonus || 0)));
}
export function getPassiveCredits(g) {
    return Math.max(0, safe(g.passiveCreditsFlat) * safe(g.passiveMultiplier, 1) * safe(g.nodeMultiplier, 1) * globalMult(g));
}
export function getPassiveData(g) {
    return Math.max(0, safe(g.passiveDataFlat) * safe(g.passiveMultiplier, 1) * dataMult(g));
}
export function getPassiveExploits(g) {
    return Math.max(0, safe(g.passiveExploitsFlat));
}
export function heatPenalty(g) {
    let p = 1;
    if (g.heat >= 75) p -= .20;
    else if (g.heat >= 50) p -= .10;
    else if (g.heat >= 25) p -= .05;
    p += safe(g.heatPenaltyReduction);
    return Math.max(.62, p);
}
export function addHeat(g, amt) {
    if (g.stealthWindow > 0) amt *= .55;
    amt *= Math.max(.18, 1 - safe(g.autoHeatReduction) * .2);
    g.heat = clamp(safe(g.heat) + amt, 0, 100);
    if (g.heat > g.stats.highestHeat) g.stats.highestHeat = g.heat;
}
export function calcFragments(g) {
    return Math.floor((Math.sqrt(Math.max(0, g.lifetimeCredits)) / 90) + (Math.max(0, g.lifetimeData) / 22) + Math.max(0, g.targetTier - 1) + Object.keys(g.bossDefeated || {}).length * 2 + (g.stats.contractsDone || 0) * .2);
}
export function previewManual(g) {
    const mode = MODES[g.runMode];
    let r = 12 * safe(g.manualMultiplier, 1) * TARGETS[g.targetTier].reward * globalMult(g) * (1 + safe(g.manualRewardPct) + (g.perks.manualBonus || 0)) * mode.manual;
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
export function manualBreach(g) {
    const t = TARGETS[g.targetTier],
        mode = MODES[g.runMode],
        comboMult = 1 + Math.min(.7, g.combo * .025 * (1 + safe(g.comboPower)));
    const crit = Math.random() < safe(g.manualCritChance),
        mega = Math.random() < safe(g.manualMegaCritChance);
    let reward = 12 * safe(g.manualMultiplier, 1) * t.reward * globalMult(g) * (1 + safe(g.manualRewardPct) + (g.perks.manualBonus || 0)) * mode.manual * comboMult;
    if (g.targetTier >= 2) reward *= 1 + safe(g.tierBonusMultiplier);
    if (crit) reward *= 2;
    if (mega) reward *= 3;
    reward = Math.round(reward);
    g.credits += reward;
    g.lifetimeCredits += reward;
    g.progress += reward * .32 * safe(g.progressMultiplier, 1);
    g.score += reward * (g.scoreMultiplier || 1);
    g.stats.totalClicks++;
    g.combo = Math.min(20, g.combo + 1);
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
    addHeat(g, 1 * t.heat * Math.max(.22, safe(g.heatGainMultiplier, 1)) * mode.heat + (g.combo >= 8 ? .15 : 0));
    if (g.contract) updateContractProgress(g, reward, data);
    return {
        reward,
        data,
        crit,
        mega
    };
}
export function coolTrace(g) {
    const removed = 12 + safe(g.coolTraceBonus);
    g.heat = Math.max(0, g.heat - removed);
    g.cooldowns.coolTrace = 10;
    return removed;
}
export function burst(g) {
    g.burstCharge = 0;
    g.cooldowns.burst = 24;
    g.stats.burstUses++;
    addBuff(g, 'Overclock Burst', 10, {
        globalMultiplier: .65,
        heatGainMultiplier: .15
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
    if (!entry) return {
        state: 'none'
    };
    const [tier, boss] = entry;
    const score = (globalMult(g) * 10) + (getPassiveCredits(g) / 25) + (20 * (1 - g.heat / 100)) + (g.targetTier * 8) + Object.keys(g.owned).length * 1.4 + Object.keys(g.nodesOwned).length * 4 + g.exploits * 6;
    const req = tier == 3 ? 55 : tier == 5 ? 120 : 220;
    g.bossProgress = Math.min(100, (score / req) * 100);
    if (score >= req) {
        g.bossDefeated[tier] = true;
        g.fragments += boss.rewardFragments;
        g.exploits += boss.rewardExploits;
        g.progress += Number(tier) * 10000;
        g.score += boss.rewardFragments * 1000;
        return {
            state: 'win',
            name: boss.name,
            fragments: boss.rewardFragments,
            exploits: boss.rewardExploits
        };
    }
    addHeat(g, 18);
    return {
        state: 'lose',
        name: boss.name
    };
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
export function runtimeData(g, tab, item) {
    return item.costData || 0;
}
export function canBuy(g, tab, item) {
    const ownedMap = getOwnedMap(g, tab);
    if (ownedMap[item.id]) return false;
    if (item.requires && !item.requires.every(req => [g.owned, g.researchOwned, g.nodesOwned, g.prestigeOwned].some(m => m[req]))) return false;
    if (tab === 'nodes') {
        if (!g.nodesUnlocked) return false;
        if (Object.keys(g.nodesOwned).length >= g.nodeSlots) return false;
    }
    const cc = runtimeCredits(g, item),
        dc = runtimeData(g, tab, item);
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
    if (g.perks.seedCapital) g.credits += 25;
    if (g.perks.coolerBoots) g.heat = Math.max(0, g.heat - 10);
}
export function maybeSpawnContract(g) {
    if (!g.contractsUnlocked || g.contract) return;
    const base = CONTRACT_TEMPLATES[Math.floor(Math.random() * CONTRACT_TEMPLATES.length)];
    const goal = Math.ceil(base.goalBase * (1 + Math.max(0, g.targetTier - 1) * .55));
    g.contract = {
        ...base,
        goal,
        progress: 0,
        timeLeft: Math.max(35, Math.floor(base.duration * (1 - g.contractSpeed)))
    };
}
export function updateContractProgress(g, creditsGain, dataGain) {
    if (!g.contract) return;
    if (g.contract.type === 'credits') g.contract.progress += creditsGain;
    if (g.contract.type === 'data') g.contract.progress += dataGain;
    if (g.contract.type === 'combo') g.contract.progress = Math.max(g.contract.progress, g.combo);
    if (g.contract.type === 'heat' && g.heat < 30) g.contract.progress = 1;
}
export function tickContract(g, dt) {
    if (!g.contract) return null;
    g.contract.timeLeft -= dt;
    if (g.contract.progress >= g.contract.goal) {
        const c = Math.round(g.contract.rewardCredits * (g.contractMultiplier + (g.perks.contractBonus || 0)));
        const d = Math.round(g.contract.rewardData * (g.contractMultiplier + (g.perks.contractBonus || 0)));
        g.credits += c;
        g.data += d;
        g.lifetimeCredits += c;
        g.lifetimeData += d;
        g.score += c + d * 20;
        g.stats.contractsDone++;
        const name = g.contract.name;
        g.contract = null;
        return {
            type: 'win',
            name,
            credits: c,
            data: d
        };
    }
    if (g.contract.timeLeft <= 0) {
        const name = g.contract.name;
        g.contract = null;
        return {
            type: 'fail',
            name
        };
    }
    return null;
}
export function rerollContract(g) {
    g.contract = null;
    maybeSpawnContract(g);
}
export function maybeAssignChallenge(g) {
    if (!g.challengesUnlocked || g.challenge || g.targetTier < 3) return;
    const ch = CHALLENGE_TEMPLATES[Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)];
    g.challenge = {
        ...ch
    };
    applyDelta(g, ch.mods, 1);
}
export function contractProgressPercent(g) {
    if (!g.contract) return 0;
    return Math.min(100, (g.contract.progress / g.contract.goal) * 100);
}
