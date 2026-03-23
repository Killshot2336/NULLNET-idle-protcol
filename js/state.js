import { VERSION, DATA } from './content.js';
import { clamp, safe } from './math.js';

export function createState(saved = {}) {
    return {
        version: VERSION,
        credits: saved.credits || 0,
        data: saved.data || 0,
        heat: saved.heat || 0,
        bandwidth: saved.bandwidth || 10,
        bandwidthUsed: 0,
        fragments: saved.fragments || 0,
        exploits: saved.exploits || 0,
        targetTier: saved.targetTier || 1,
        progress: saved.progress || 0,
        runMode: saved.runMode || 'balanced',
        bossProgress: saved.bossProgress || 0,
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
        contractMultiplier: 1,
        contractBonus: 0,
        contractSpeed: 0,
        eventValueMultiplier: 0,
        scoreMultiplier: 1,
        challengeMultiplier: 1,
        nodesUnlocked: false,
        contractsUnlocked: false,
        challengesUnlocked: false,
        contractSlots: 0,
        nodeSlots: 2,
        deepParse: false,
        parallelChains: false,
        comboPower: 0,
        comboDecayPenalty: 0,
        minHeatFloor: 0,
        lowHeatRewardBonus: 0,
        startExploitBonus: 0,
        combo: saved.combo || 0,
        comboTimer: saved.comboTimer || 0,
        burstCharge: saved.burstCharge || 0,
        stealthWindow: saved.stealthWindow || 0,
        lifetimeCredits: saved.lifetimeCredits || 0,
        lifetimeData: saved.lifetimeData || 0,
        owned: saved.owned || {},
        researchOwned: saved.researchOwned || {},
        nodesOwned: saved.nodesOwned || {},
        prestigeOwned: saved.prestigeOwned || {},
        achievements: saved.achievements || {},
        milestones: saved.milestones || {},
        recentUnlocks: saved.recentUnlocks || [],
        tutorialIndex: saved.tutorialIndex || 0,
        originId: saved.originId || null,
        originSelected: saved.originSelected || false,
        mutationsOwned: saved.mutationsOwned || [],
        mutationDraft: saved.mutationDraft || [],
        emergencyReady: saved.emergencyReady || false,
        emergencyUsed: saved.emergencyUsed || false,
        warningState: saved.warningState || false,
        perks: saved.perks || {
            seedCapital: false,
            coolerBoots: false,
            globalBonus: 0,
            dataBonus: 0,
            fastInit: false,
            manualBonus: 0,
            contractBonus: 0
        },
        stats: saved.stats || {
            totalClicks: 0,
            totalResets: 0,
            highestHeat: 0,
            eventsSeen: 0,
            totalPlaytime: 0,
            lowHeatTime: 0,
            burstUses: 0,
            exploitUses: 0,
            contractsDone: 0,
            challengesDone: 0
        },
        cooldowns: saved.cooldowns || {
            coolTrace: 0,
            burst: 0,
            exploit: 0
        },
        contract: saved.contract || null,
        challenge: saved.challenge || null,
        score: saved.score || 0,
        eventTimer: saved.eventTimer || 15,
        eventBuffs: saved.eventBuffs || [],
        lastTick: saved.lastTick || Date.now(),
        previewFragments: 0,
        runBonusesApplied: saved.runBonusesApplied || false,
        _metaApplied: false
    };
}

export function sanitizeState(g) {
    const numericKeys = ['credits', 'data', 'heat', 'bandwidth', 'bandwidthUsed', 'fragments', 'exploits', 'targetTier', 'progress', 'bossProgress', 'manualMultiplier', 'manualCritChance', 'manualMegaCritChance', 'manualDataChance', 'manualRewardPct', 'passiveCreditsFlat', 'passiveDataFlat', 'passiveExploitsFlat', 'passiveMultiplier', 'globalMultiplier', 'dataMultiplier', 'nodeMultiplier', 'progressMultiplier', 'heatGainMultiplier', 'heatDecayMultiplier', 'heatPenaltyReduction', 'autoHeatReduction', 'badEventReduction', 'badEventCancelChance', 'coolTraceBonus', 'burstGainMultiplier', 'tierBonusMultiplier', 'contractMultiplier', 'contractBonus', 'contractSpeed', 'eventValueMultiplier', 'scoreMultiplier', 'challengeMultiplier', 'contractSlots', 'nodeSlots', 'comboPower', 'comboDecayPenalty', 'minHeatFloor', 'lowHeatRewardBonus', 'startExploitBonus', 'combo', 'comboTimer', 'burstCharge', 'stealthWindow', 'lifetimeCredits', 'lifetimeData', 'score', 'eventTimer', 'previewFragments', 'lastTick'];
    for (const key of numericKeys) g[key] = Math.max(0, safe(g[key], 0));
    g.heat = clamp(g.heat, 0, 100);
    g.targetTier = clamp(Math.floor(g.targetTier || 1), 1, 8);
    if (!['balanced', 'ghost', 'overclock', 'architect'].includes(g.runMode)) g.runMode = 'balanced';
    for (const key of ['owned', 'researchOwned', 'nodesOwned', 'prestigeOwned', 'achievements', 'milestones', 'bossDefeated'])
        if (!g[key] || typeof g[key] !== 'object') g[key] = {};
    if (!Array.isArray(g.recentUnlocks)) g.recentUnlocks = [];
    if (!Array.isArray(g.eventBuffs)) g.eventBuffs = [];
    if (!Array.isArray(g.mutationsOwned)) g.mutationsOwned = [];
    if (!Array.isArray(g.mutationDraft)) g.mutationDraft = [];
    if (!g.stats || typeof g.stats !== 'object') g.stats = {
        totalClicks: 0, totalResets: 0, highestHeat: 0, eventsSeen: 0, totalPlaytime: 0, lowHeatTime: 0, burstUses: 0, exploitUses: 0, contractsDone: 0, challengesDone: 0
    };
    if (!g.cooldowns || typeof g.cooldowns !== 'object') g.cooldowns = { coolTrace: 0, burst: 0, exploit: 0 };
    return g;
}

export function rebuildPermanentState(g) {
    const fresh = createState(g);
    Object.assign(fresh, {
        credits: g.credits || 0,
        data: g.data || 0,
        heat: g.heat || 0,
        fragments: g.fragments || 0,
        exploits: g.exploits || 0,
        targetTier: g.targetTier || 1,
        progress: g.progress || 0,
        runMode: g.runMode || 'balanced',
        bossProgress: g.bossProgress || 0,
        bossDefeated: g.bossDefeated || {},
        combo: g.combo || 0,
        comboTimer: g.comboTimer || 0,
        burstCharge: g.burstCharge || 0,
        stealthWindow: g.stealthWindow || 0,
        lifetimeCredits: g.lifetimeCredits || 0,
        lifetimeData: g.lifetimeData || 0,
        score: g.score || 0,
        contract: g.contract || null,
        challenge: g.challenge || null,
        owned: g.owned || {},
        researchOwned: g.researchOwned || {},
        nodesOwned: g.nodesOwned || {},
        prestigeOwned: g.prestigeOwned || {},
        achievements: g.achievements || {},
        milestones: g.milestones || {},
        recentUnlocks: g.recentUnlocks || [],
        tutorialIndex: g.tutorialIndex || 0,
        originId: g.originId || null,
        originSelected: g.originSelected || false,
        mutationsOwned: g.mutationsOwned || [],
        mutationDraft: g.mutationDraft || [],
        emergencyReady: g.emergencyReady || false,
        emergencyUsed: g.emergencyUsed || false,
        warningState: g.warningState || false,
        runBonusesApplied: g.runBonusesApplied || false,
        perks: g.perks || fresh.perks,
        stats: g.stats || fresh.stats,
        cooldowns: g.cooldowns || fresh.cooldowns,
        eventTimer: g.eventTimer || 30,
        eventBuffs: g.eventBuffs || [],
        lastTick: g.lastTick || Date.now()
    });
    const apply = (items, owned) => {
        for (const item of items) {
            if (!owned[item.id]) continue;
            for (const [k, v] of Object.entries(item.delta)) {
                if (typeof v === 'boolean') fresh[k] = v;
                else fresh[k] = (fresh[k] || 0) + v;
            }
            if (item.bandwidth) fresh.bandwidthUsed += item.bandwidth;
        }
    };
    apply(DATA.scripts, fresh.owned);
    apply(DATA.automation, fresh.owned);
    apply(DATA.stealth, fresh.owned);
    apply(DATA.hardware, fresh.owned);
    apply(DATA.contracts, fresh.owned);
    apply(DATA.labs, fresh.owned);
    apply(DATA.challenges, fresh.owned);
    apply(DATA.research, fresh.researchOwned);
    apply(DATA.nodes, fresh.nodesOwned);
    if (fresh.challenge?.mods) {
        for (const [k, v] of Object.entries(fresh.challenge.mods)) {
            if (typeof v === 'boolean') fresh[k] = v;
            else fresh[k] = (fresh[k] || 0) + v;
        }
    }
    if (fresh.prestigeOwned.seed_capital) fresh.perks.seedCapital = true;
    if (fresh.prestigeOwned.signal_familiarity) fresh.perks.globalBonus = .05;
    if (fresh.prestigeOwned.cooler_boots) fresh.perks.coolerBoots = true;
    if (fresh.prestigeOwned.deep_recall) fresh.perks.dataBonus = .10;
    if (fresh.prestigeOwned.fast_init) fresh.perks.fastInit = true;
    if (fresh.prestigeOwned.season_memory) fresh.perks.contractBonus = .15;
    sanitizeState(fresh);
    return fresh;
}
