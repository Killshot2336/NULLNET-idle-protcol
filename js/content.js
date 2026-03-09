import {
    validateCollections
} from './validation.js';
export const VERSION = 4;
export const TABS = ['scripts', 'automation', 'stealth', 'hardware', 'research', 'nodes', 'contracts', 'labs', 'challenges', 'prestige'];
export const MODES = {
    balanced: {
        name: 'Balanced',
        tag: 'Hybrid',
        manual: 1,
        passive: 1,
        heat: 1,
        data: 1
    },
    ghost: {
        name: 'Ghost',
        tag: 'Stealth',
        manual: .92,
        passive: 1.03,
        heat: .72,
        data: 1.14
    },
    overclock: {
        name: 'Overclock',
        tag: 'Aggressive',
        manual: 1.25,
        passive: 1.1,
        heat: 1.36,
        data: .92
    },
    architect: {
        name: 'Architect',
        tag: 'Nodes',
        manual: .84,
        passive: 1.18,
        heat: .96,
        data: 1.02
    }
};
export const TARGETS = {
    1: {
        name: 'Civilian Devices',
        reward: 1.15,
        heat: 1,
        desc: 'Phones, weak inboxes, home routers, personal laptops.',
        heatMeta: 'Low trace risk',
        risk: 'Minimal',
        threshold: 900
    },
    2: {
        name: 'Small Businesses',
        reward: 2.35,
        heat: 1.18,
        desc: 'Booking systems, payroll panels, local office servers.',
        heatMeta: 'Moderate trace risk',
        risk: 'Low',
        threshold: 8500
    },
    3: {
        name: 'Corporate Networks',
        reward: 5.2,
        heat: 1.62,
        desc: 'Cloud dashboards, finance routes, admin consoles.',
        heatMeta: 'High trace risk',
        risk: 'Elevated',
        threshold: 82000
    },
    4: {
        name: 'Financial Infrastructure',
        reward: 10.5,
        heat: 1.95,
        desc: 'Trading tools, vault routing, protected finance layers.',
        heatMeta: 'Severe trace risk',
        risk: 'High',
        threshold: 480000
    },
    5: {
        name: 'Defense Contractors',
        reward: 20,
        heat: 2.3,
        desc: 'Weapons logistics, private defense archives, secure contractors.',
        heatMeta: 'Severe trace pressure',
        risk: 'Critical',
        threshold: 2200000
    },
    6: {
        name: 'Government Networks',
        reward: 37,
        heat: 2.7,
        desc: 'Agency data paths, internal security systems, trace cores.',
        heatMeta: 'Extreme trace pressure',
        risk: 'Extreme',
        threshold: 9000000
    },
    7: {
        name: 'Black Network',
        reward: 68,
        heat: 3.1,
        desc: 'Ghost clusters, illegal data markets, rogue infrastructure.',
        heatMeta: 'Illegal network instability',
        risk: 'Extreme',
        threshold: 40000000
    },
    8: {
        name: 'Null Layer',
        reward: 120,
        heat: 3.55,
        desc: 'Hidden layer beyond conventional routing. Final layer.',
        heatMeta: 'Unstable null-state pressure',
        risk: 'Terminal',
        threshold: Infinity
    }
};
export const BOSSES = {
    3: {
        name: 'Corporate AI Firewall',
        desc: 'Aggressive defensive intelligence.',
        rewardFragments: 2,
        rewardExploits: 1
    },
    5: {
        name: 'Financial Blackwall',
        desc: 'Massive tracing pressure and reward suppression.',
        rewardFragments: 4,
        rewardExploits: 2
    },
    7: {
        name: 'Government Trace Core',
        desc: 'Brutal lockout pressure.',
        rewardFragments: 7,
        rewardExploits: 3
    }
};
const u = (id, name, desc, costCredits, delta, requires = [], costData = 0, bandwidth = 0) => ({
    id,
    name,
    desc,
    costCredits,
    costData,
    bandwidth,
    requires,
    delta
});
const p = (id, name, desc, costFragments, key, value = true) => ({
    id,
    name,
    desc,
    costFragments,
    key,
    value
});
const a = (id, name, check) => ({
    id,
    name,
    check
});
const m = (id, name, check) => ({
    id,
    name,
    check
});
export const DATA = {
    scripts: [u('script_boost_1', 'Script Boost I', '+100% manual breach reward.', 20, {
        manualMultiplier: 1
    }), u('script_boost_2', 'Script Boost II', '+100% manual breach reward.', 80, {
        manualMultiplier: 1
    }, ['script_boost_1']), u('recursive_sweep', 'Recursive Sweep', '+10% crit chance.', 260, {
        manualCritChance: .10
    }), u('data_scraper', 'Data Scraper', '+12% data chance.', 420, {
        manualDataChance: .12
    }), u('precision_payload', 'Precision Payload', '+20% manual reward on Tier 2+.', 900, {
        tierBonusMultiplier: .20
    }, [], 10), u('burst_compiler', 'Burst Compiler', 'Burst charges faster.', 1500, {
        burstGainMultiplier: .45
    }, [], 18), u('overrun_routine', 'Overrun Routine', '+6% mega-crit chance.', 3200, {
        manualMegaCritChance: .06
    }, [], 30), u('deep_parse', 'Deep Parse', 'Crits add extra Data.', 6400, {
        deepParse: true
    }, [], 55), u('surgical_injector', 'Surgical Injector', '+25% manual reward.', 12000, {
        manualRewardPct: .25
    }, [], 90), u('null_slicer', 'Null Slicer', '+8% crit chance.', 22000, {
        manualCritChance: .08
    }, [], 150), u('phantom_rake', 'Phantom Rake', '+20% combo power.', 42000, {
        comboPower: .20
    }, [], 240), u('terminal_reaver', 'Terminal Reaver', '+40% manual reward.', 76000, {
        manualRewardPct: .40
    }, [], 380)],
    automation: [u('auto_script_1', 'Auto Script I', '+2 Credits/sec.', 60, {
        passiveCreditsFlat: 2
    }, [], 0, 2), u('auto_script_2', 'Auto Script II', '+3 Credits/sec.', 430, {
        passiveCreditsFlat: 3
    }, ['auto_script_1'], 0, 2), u('thread_splitter', 'Thread Splitter', '+20% automation output.', 180, {
        passiveMultiplier: .20
    }), u('data_daemon', 'Data Daemon', '+0.25 Data/sec.', 1250, {
        passiveDataFlat: .25
    }, [], 8, 3), u('queue_optimizer', 'Queue Optimizer', '+25% automation output.', 2600, {
        passiveMultiplier: .25
    }, [], 20), u('silent_worker_pool', 'Silent Worker Pool', 'Automation generates less heat.', 4300, {
        autoHeatReduction: .16
    }, [], 36), u('parallel_chains', 'Parallel Chains', 'Automation occasionally surges.', 7800, {
        parallelChains: true
    }, [], 65), u('ghost_scheduler', 'Ghost Scheduler', '+45% automation output.', 15000, {
        passiveMultiplier: .45
    }, [], 120), u('daemon_mesh', 'Daemon Mesh', '+12 Credits/sec.', 32000, {
        passiveCreditsFlat: 12
    }, [], 220, 4), u('relay_swarm', 'Relay Swarm', '+35% automation output.', 58000, {
        passiveMultiplier: .35
    }, [], 340)],
    stealth: [u('proxy_layer', 'Proxy Layer', '-10% heat gain.', 500, {
        heatGainMultiplier: -.10
    }), u('trace_blur', 'Trace Blur', '+35% heat decay speed.', 900, {
        heatDecayMultiplier: .35
    }), u('noise_injection', 'Noise Injection', 'Lower bad event chance.', 1600, {
        badEventReduction: .15
    }, [], 12), u('signature_scrambler', 'Signature Scrambler', 'Heat penalties reduced.', 2800, {
        heatPenaltyReduction: .08
    }, [], 18), u('decoy_traffic', 'Decoy Traffic', '5% chance to cancel bad events.', 5200, {
        badEventCancelChance: .05
    }, [], 36), u('heat_sink', 'Heat Sink', 'Cool Trace becomes stronger.', 8100, {
        coolTraceBonus: 8
    }, [], 55), u('ghost_mask', 'Ghost Mask', '-15% heat gain and +8% data.', 22000, {
        heatGainMultiplier: -.15,
        dataMultiplier: .08
    }, [], 160), u('dead_signal', 'Dead Signal', '+50% heat decay speed.', 42000, {
        heatDecayMultiplier: .50
    }, [], 240)],
    hardware: [u('ram_stack', 'RAM Stack', '+5 Bandwidth.', 1000, {
        bandwidth: 5
    }, [], 10), u('black_asic', 'Black ASIC Unit', '+15% total rewards.', 2400, {
        globalMultiplier: .15
    }, [], 18), u('signal_booster', 'Signal Booster', '+10 Bandwidth.', 4200, {
        bandwidth: 10
    }, [], 30), u('illegal_coprocessor', 'Illegal Coprocessor', '+20% automation output.', 7000, {
        passiveMultiplier: .20
    }, [], 54), u('cache_bank', 'Cache Bank', '+18% data gain.', 10000, {
        dataMultiplier: .18
    }, [], 82), u('command_chassis', 'Command Chassis', 'Nodes produce more.', 14500, {
        nodeMultiplier: .22
    }, [], 110), u('quantum_relay', 'Quantum Relay Board', '+28% all gains.', 24000, {
        globalMultiplier: .28
    }, [], 180), u('null_battery', 'Null Battery', '+15 Bandwidth and +10% all gains.', 58000, {
        bandwidth: 15,
        globalMultiplier: .10
    }, [], 400)],
    research: [u('target_mapping', 'Target Mapping', 'Advance tiers faster.', 0, {
        progressMultiplier: .15
    }, [], 10), u('chain_access', 'Chain Access', '+10% all rewards.', 0, {
        globalMultiplier: .10
    }, ['target_mapping'], 18), u('node_theory', 'Node Theory', 'Unlock nodes.', 0, {
        nodesUnlocked: true
    }, ['target_mapping'], 25), u('bandwidth_compression', 'Bandwidth Compression', '+5 Bandwidth.', 0, {
        bandwidth: 5
    }, [], 35), u('deep_entry', 'Deep Entry', '+20% all rewards.', 0, {
        globalMultiplier: .20
    }, ['chain_access'], 60), u('node_expansion_1', 'Node Expansion I', '+1 node slot.', 0, {
        nodeSlots: 1
    }, ['node_theory'], 95), u('aggressive_routing', 'Aggressive Routing', '+20% manual reward.', 0, {
        manualRewardPct: .20
    }, ['deep_entry'], 130), u('seasonal_forecasting', 'Seasonal Forecasting', 'Contracts are more valuable.', 0, {
        contractMultiplier: .25
    }, ['deep_entry'], 175)],
    nodes: [u('relay_node', 'Relay Node', '+3 Credits/sec. Costs 3 BW.', 500, {
        passiveCreditsFlat: 3
    }, [], 20, 3), u('compute_node', 'Compute Node', '+15% automation output. Costs 5 BW.', 1250, {
        passiveMultiplier: .15
    }, [], 28, 5), u('storage_node', 'Storage Node', '+0.35 Data/sec. Costs 4 BW.', 1600, {
        passiveDataFlat: .35
    }, [], 20, 4), u('ghost_node', 'Ghost Node', '-10% heat gain. Costs 4 BW.', 2400, {
        heatGainMultiplier: -.10
    }, [], 25, 4), u('swarm_node', 'Swarm Node', '+10% tier progress. Costs 5 BW.', 4200, {
        progressMultiplier: .10
    }, [], 45, 5), u('exploit_lab', 'Exploit Lab', '+0.04 Exploits/sec. Costs 6 BW.', 8000, {
        passiveExploitsFlat: .04
    }, [], 65, 6), u('stealth_hub', 'Stealth Hub', '+20% heat decay. Costs 5 BW.', 15000, {
        heatDecayMultiplier: .20
    }, [], 95, 5), u('contract_hub', 'Contract Hub', 'Contracts pay +20%. Costs 6 BW.', 28000, {
        contractMultiplier: .20
    }, [], 150, 6)],
    contracts: [u('contract_ops_1', 'Contract Office I', 'Unlocks contracts and +1 contract slot.', 650, {
        contractsUnlocked: true,
        contractSlots: 1
    }, [], 8), u('contract_ops_2', 'Contract Office II', '+1 contract slot and +10% contract rewards.', 5200, {
        contractSlots: 1,
        contractMultiplier: .10
    }, ['contract_ops_1'], 40), u('broker_line', 'Broker Line', 'Rerolls cost less and contracts spawn faster.', 18000, {
        contractSpeed: .15
    }, ['contract_ops_1'], 120), u('elite_brokerage', 'Elite Brokerage', 'Contracts pay +25%.', 36000, {
        contractMultiplier: .25
    }, ['contract_ops_2'], 200)],
    labs: [u('lab_reactor_1', 'Lab Reactor I', '+12% all rewards.', 9000, {
        globalMultiplier: .12
    }, [], 90), u('lab_reactor_2', 'Lab Reactor II', '+20% all rewards.', 24000, {
        globalMultiplier: .20
    }, ['lab_reactor_1'], 180), u('lab_entropy', 'Entropy Lab', 'Events become stronger on average.', 38000, {
        eventValueMultiplier: .20
    }, ['lab_reactor_1'], 230), u('lab_singularity', 'Singularity Lab', '+25% passive output and +10 BW.', 72000, {
        passiveMultiplier: .25,
        bandwidth: 10
    }, ['lab_reactor_2'], 380)],
    challenges: [u('challenge_linebreaker', 'Linebreaker', 'Activates challenge pool and +10% score gain.', 12000, {
        challengesUnlocked: true,
        scoreMultiplier: .10
    }, [], 80), u('challenge_mastery', 'Challenge Mastery', 'Challenge rewards are stronger.', 42000, {
        challengeMultiplier: .25
    }, ['challenge_linebreaker'], 260)],
    prestige: [p('seed_capital', 'Seed Capital', 'Start each run with +25 Credits.', 1, 'seedCapital'), p('signal_familiarity', 'Signal Familiarity', '+5% total rewards permanently.', 2, 'globalBonus', .05), p('cooler_boots', 'Cooler Boots', 'Start each run with lower Heat.', 2, 'coolerBoots'), p('deep_recall', 'Deep Recall', '+10% data gain permanently.', 3, 'dataBonus', .10), p('fast_init', 'Fast Initialization', 'Auto Script I is cheaper.', 3, 'fastInit'), p('operator_instinct', 'Operator Instinct', '+10% manual rewards permanently.', 7, 'manualBonus', .10), p('season_memory', 'Season Memory', '+15% contract rewards permanently.', 9, 'contractBonus', .15)]
};
validateCollections(DATA);
export const EVENTS = [
    ['good', 'Insider Leak', 'Gain instant Data.', g => {
        const d = 8 + g.targetTier * 2;
        g.data += d;
        g.lifetimeData += d;
    }],
    ['good', 'Ghost Cache', 'Gain Credits instantly.', g => {
        const c = 180 * g.targetTier;
        g.credits += c;
        g.lifetimeCredits += c;
    }],
    ['good', 'Open Port Window', 'Automation boosted for 20s.', g => g._addBuff('Open Port Window', 20, {
        passiveMultiplier: .35
    })],
    ['good', 'Leaked Admin Map', 'Tier progress boosted for 18s.', g => g._addBuff('Leaked Admin Map', 18, {
        progressMultiplier: .22
    })],
    ['good', 'Zero-Day Fragment', 'Gain burst charge and 1 Exploit.', g => {
        g.burstCharge = Math.min(100, g.burstCharge + 35);
        g.exploits += 1;
    }],
    ['warn', 'Trace Spike', '+15 Heat.', g => {
        g.heat = Math.min(100, g.heat + 15);
    }],
    ['bad', 'Firewall Sweep', 'Rewards suppressed for 16s.', g => g._addBuff('Firewall Sweep', 16, {
        globalMultiplier: -.18
    })],
    ['bad', 'Counter Scan', 'Heat gain increased for 12s.', g => g._addBuff('Counter Scan', 12, {
        heatGainMultiplier: .18
    })],
    ['bad', 'Node Instability', 'Combo chain damaged.', g => {
        g.combo = Math.max(0, g.combo - 4);
    }],
    ['good', 'Legendary Vault', 'Huge resource package.', g => {
        const c = 5000 * g.targetTier;
        const d = 40 + g.targetTier * 4;
        g.credits += c;
        g.lifetimeCredits += c;
        g.data += d;
        g.lifetimeData += d;
        g.exploits += 2;
    }],
    ['good', 'Rogue Lab', 'Gain 2 Exploits.', g => {
        g.exploits += 2;
    }],
    ['warn', 'Honey Pot Trigger', 'Heat spikes and combo reset.', g => {
        g.heat = Math.min(100, g.heat + 22);
        g.combo = 0;
    }],
    ['good', 'Null Pulse', '+25% all gains for 14s.', g => g._addBuff('Null Pulse', 14, {
        globalMultiplier: .25
    })],
    ['bad', 'Watcher Array', 'Automation weakened for 18s.', g => g._addBuff('Watcher Array', 18, {
        passiveMultiplier: -.24
    })],
    ['good', 'Contract Leak', 'Active contract progress boosted.', g => {
        if (g.contract) {
            g.contract.progress += Math.max(1, g.contract.goal * .18);
        }
    }],
    ['good', 'Lab Resonance', 'Event values increase for 20s.', g => g._addBuff('Lab Resonance', 20, {
        eventValueMultiplier: .20
    })]
];
export const CONTRACT_TEMPLATES = [{
    id: 'credit_surge',
    name: 'Credit Surge',
    desc: 'Earn a burst of Credits before the timer ends.',
    goalBase: 1200,
    rewardCredits: 1800,
    rewardData: 10,
    duration: 80,
    type: 'credits'
}, {
    id: 'data_raid',
    name: 'Data Raid',
    desc: 'Gather Data under pressure.',
    goalBase: 14,
    rewardCredits: 1400,
    rewardData: 18,
    duration: 85,
    type: 'data'
}, {
    id: 'heat_control',
    name: 'Heat Discipline',
    desc: 'Finish with heat under 30.',
    goalBase: 1,
    rewardCredits: 3200,
    rewardData: 18,
    duration: 80,
    type: 'heat'
}, {
    id: 'combo_hunt',
    name: 'Combo Hunt',
    desc: 'Build a combo chain of 12.',
    goalBase: 12,
    rewardCredits: 4200,
    rewardData: 18,
    duration: 100,
    type: 'combo'
}];
export const CHALLENGE_TEMPLATES = [{
    id: 'low_heat',
    name: 'Cold Route',
    desc: 'All gains +25%, heat decay -40%, contract rewards +20%.',
    mods: {
        globalMultiplier: .25,
        heatDecayMultiplier: -.40,
        contractMultiplier: .20
    }
}, {
    id: 'scorched',
    name: 'Scorched Grid',
    desc: 'All gains +40%, heat gain +35%.',
    mods: {
        globalMultiplier: .40,
        heatGainMultiplier: .35
    }
}, {
    id: 'thin_bandwidth',
    name: 'Thin Bandwidth',
    desc: 'Lower BW, stronger contracts and nodes.',
    mods: {
        bandwidth: -5,
        contractMultiplier: .35,
        nodeMultiplier: .25
    }
}];
export const ACHIEVEMENTS = [a('first_breach', 'First Breach', g => g.stats.totalClicks >= 1), a('hundred_credits', '100 Credits', g => g.lifetimeCredits >= 100), a('auto_online', 'Automation Online', g => !!g.owned.auto_script_1), a('watched', 'Watched State', g => g.stats.highestHeat >= 25), a('critical_heat', 'Critical Heat', g => g.stats.highestHeat >= 75), a('researcher', 'First Research', g => Object.keys(g.researchOwned).length >= 1), a('node_owner', 'First Node', g => Object.keys(g.nodesOwned).length >= 1), a('contractor', 'First Contract', g => g.stats.contractsDone >= 1), a('lab_online', 'First Lab', g => Object.keys(g.owned).some(id => id.startsWith('lab_'))), a('tier_three', 'Tier 3', g => g.targetTier >= 3), a('tier_five', 'Tier 5', g => g.targetTier >= 5), a('first_reset', 'Protocol Reset', g => g.stats.totalResets >= 1), a('boss_1', 'Firewall Broken', g => !!g.bossDefeated[3]), a('score_1', '10K Score', g => g.score >= 10000), a('score_2', '100K Score', g => g.score >= 100000)];
export const MILESTONES = [m('scripts_online', 'Scripts Online', g => g.lifetimeCredits >= 25), m('automation_online', 'Automation Online', g => g.lifetimeCredits >= 150), m('hardware_online', 'Hardware Online', g => g.lifetimeCredits >= 1000 && g.lifetimeData >= 10), m('contracts_online', 'Contracts Online', g => g.contractsUnlocked), m('labs_online', 'Lab Wing Online', g => Object.keys(g.owned).some(id => id.startsWith('lab_'))), m('tier_2', 'Expand to Tier 2', g => g.targetTier >= 2), m('tier_3', 'Expand to Tier 3', g => g.targetTier >= 3), m('tier_5', 'Expand to Tier 5', g => g.targetTier >= 5), m('node_theory', 'Node Grid Online', g => g.nodesUnlocked), m('first_reset', 'Reset Available', g => g.previewFragments >= 1)];
export const TUTORIAL_STEPS = [{
    title: 'Step 1 · Run your first breach',
    done: g => g.stats.totalClicks >= 1
}, {
    title: 'Step 2 · Buy your first upgrade',
    done: g => !!g.owned.script_boost_1
}, {
    title: 'Step 3 · Bring automation online',
    done: g => !!g.owned.auto_script_1
}, {
    title: 'Step 4 · Open contracts',
    done: g => g.contractsUnlocked
}, {
    title: 'Step 5 · Prepare for resets',
    done: g => g.previewFragments >= 1
}];
