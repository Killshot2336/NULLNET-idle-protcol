import {
    VERSION,
    DATA
} from './content.js';
import {
    clamp,
    safe
} from './math.js';
export function createState(saved = {}) {
    return {
        version: VERSION,
        credits: 0,
        data: 0,
        heat: 0,
        bandwidth: 10,
        bandwidthUsed: 0,
        fragments: saved.fragments || 0,
        exploits: saved.exploits || 0,
        targetTier: 1,
        progress: 0,
        runMode: saved.runMode || 'balanced',
        bossProgress: 0,
        bossDefeated: saved.bossDefeated || {},
        manualMultiplier: 1,
        manualCritChance: 0,
        manualMegaCritChance: 0,
        manualDataChance: .20,
        manualRewardPct: 0,
        passiveCreditsFlat: 0,
        passiveDataFlat: 0,
        passiveExploitsFlat: 0,
        passiveMultiplier: 1,
        globalMultiplier: 1,
        dataMultiplier: 1,
        nodeMultiplier: 1,
        progressMultiplier: 1,
        heatGainMultiplier: 1,
        heatDecayMultiplier: 1,
        heatPenaltyReduction: 0,
        autoHeatReduction: 0,
        badEventReduction: 0,
        badEventCancelChance: 0,
        coolTraceBonus: 0,
        burstGainMultiplier: 1,
        tierBonusMultiplier: 0,
        nodesUnlocked: false,
        nodeSlots: 2,
        deepParse: false,
        parallelChains: false,
        comboPower: 0,
        combo: 0,
        comboTimer: 0,
        burstCharge: 0,
        stealthWindow: 0,
        lifetimeCredits: 0,
        lifetimeData: 0,
        owned: saved.owned || {},
        researchOwned: saved.researchOwned || {},
        nodesOwned: saved.nodesOwned || {},
        prestigeOwned: saved.prestigeOwned || {},
        achievements: saved.achievements || {},
        milestones: saved.milestones || {},
        recentUnlocks: saved.recentUnlocks || [],
        tutorialIndex: saved.tutorialIndex || 0,
        perks: saved.perks || {
            seedCapital: false,
            coolerBoots: false,
            globalBonus: 0,
            dataBonus: 0,
            fastInit: false,
            manualBonus: 0
        },
        stats: saved.stats || {
            totalClicks: 0,
            totalResets: 0,
            highestHeat: 0,
            eventsSeen: 0,
            totalPlaytime: 0,
            lowHeatTime: 0,
            burstUses: 0,
            exploitUses: 0
        },
        cooldowns: {
            coolTrace: 0,
            burst: 0,
            exploit: 0
        },
        eventTimer: 30,
        eventBuffs: [],
        lastTick: Date.now(),
        previewFragments: 0
    };
}
export function sanitizeState(g) {
    for (const k of ['credits', 'data', 'heat', 'bandwidth', 'bandwidthUsed', 'fragments', 'exploits', 'targetTier', 'progress', 'manualMultiplier', 'manualCritChance', 'manualMegaCritChance', 'manualDataChance', 'manualRewardPct', 'passiveCreditsFlat', 'passiveDataFlat', 'passiveExploitsFlat', 'passiveMultiplier', 'globalMultiplier', 'dataMultiplier', 'nodeMultiplier', 'progressMultiplier', 'heatGainMultiplier', 'heatDecayMultiplier', 'heatPenaltyReduction', 'autoHeatReduction', 'badEventReduction', 'badEventCancelChance', 'coolTraceBonus', 'burstGainMultiplier', 'tierBonusMultiplier', 'nodeSlots', 'comboPower', 'combo', 'comboTimer', 'burstCharge', 'stealthWindow', 'lifetimeCredits', 'lifetimeData', 'eventTimer', 'previewFragments']) g[k] = Math.max(0, safe(g[k], 0));
    g.heat = clamp(g.heat, 0, 100);
    g.targetTier = clamp(Math.floor(g.targetTier || 1), 1, 8);
    if (!['balanced', 'ghost', 'overclock', 'architect'].includes(g.runMode)) g.runMode = 'balanced';
    for (const key of ['owned', 'researchOwned', 'nodesOwned', 'prestigeOwned', 'achievements', 'milestones', 'bossDefeated'])
        if (!g[key] || typeof g[key] !== 'object') g[key] = {};
    if (!Array.isArray(g.recentUnlocks)) g.recentUnlocks = [];
    if (!Array.isArray(g.eventBuffs)) g.eventBuffs = [];
    if (!g.stats || typeof g.stats !== 'object') g.stats = {
        totalClicks: 0,
        totalResets: 0,
        highestHeat: 0,
        eventsSeen: 0,
        totalPlaytime: 0,
        lowHeatTime: 0,
        burstUses: 0,
        exploitUses: 0
    };
    if (!g.cooldowns || typeof g.cooldowns !== 'object') g.cooldowns = {
        coolTrace: 0,
        burst: 0,
        exploit: 0
    };
    return g;
}
export function rebuildPermanentState(g) {
    const fresh = createState(g);
    Object.assign(fresh, {
        fragments: g.fragments || 0,
        exploits: g.exploits || 0,
        targetTier: g.targetTier || 1,
        progress: g.progress || 0,
        runMode: g.runMode || 'balanced',
        bossDefeated: g.bossDefeated || {},
        owned: g.owned || {},
        researchOwned: g.researchOwned || {},
        nodesOwned: g.nodesOwned || {},
        prestigeOwned: g.prestigeOwned || {},
        achievements: g.achievements || {},
        milestones: g.milestones || {},
        recentUnlocks: g.recentUnlocks || [],
        tutorialIndex: g.tutorialIndex || 0,
        perks: g.perks || fresh.perks,
        stats: g.stats || fresh.stats,
        lifetimeCredits: g.lifetimeCredits || 0,
        lifetimeData: g.lifetimeData || 0
    });
    const apply = (items, owned) => {
        for (const item of items) {
            if (owned[item.id]) {
                for (const [k, v] of Object.entries(item.delta)) {
                    if (typeof v === 'boolean') fresh[k] = v;
                    else fresh[k] = (fresh[k] || 0) + v;
                }
                if (item.bandwidth) fresh.bandwidthUsed += item.bandwidth;
            }
        }
    };
    apply(DATA.scripts, fresh.owned);
    apply(DATA.automation, fresh.owned);
    apply(DATA.stealth, fresh.owned);
    apply(DATA.hardware, fresh.owned);
    apply(DATA.research, fresh.researchOwned);
    apply(DATA.nodes, fresh.nodesOwned);
    if (fresh.prestigeOwned.seed_capital) fresh.perks.seedCapital = true;
    if (fresh.prestigeOwned.signal_familiarity) fresh.perks.globalBonus = .05;
    if (fresh.prestigeOwned.cooler_boots) fresh.perks.coolerBoots = true;
    if (fresh.prestigeOwned.deep_recall) fresh.perks.dataBonus = .10;
    if (fresh.prestigeOwned.fast_init) fresh.perks.fastInit = true;
    sanitizeState(fresh);
    return fresh;
}
