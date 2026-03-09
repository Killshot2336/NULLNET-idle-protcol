import {
    validateCollections
} from './validation.js';
export const VERSION = 3;
export const TABS = ['scripts', 'automation', 'stealth', 'hardware', 'research', 'nodes', 'prestige'];
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
        reward: 1,
        heat: 1,
        desc: 'Phones, weak inboxes, home routers, personal laptops.',
        heatMeta: 'Low trace risk',
        risk: 'Minimal',
        threshold: 1400
    },
    2: {
        name: 'Small Businesses',
        reward: 2.2,
        heat: 1.2,
        desc: 'Booking systems, payroll panels, local office servers.',
        heatMeta: 'Moderate trace risk',
        risk: 'Low',
        threshold: 12000
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
        desc: 'Hidden layer beyond conventional routing. V1 endgame.',
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
    scripts: [u('script_boost_1', 'Script Boost I', '+100% manual breach reward.', 25, {
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
    }, [], 18)],
    automation: [u('auto_script_1', 'Auto Script I', '+1 Credits/sec.', 150, {
        passiveCreditsFlat: 1
    }, [], 0, 2), u('auto_script_2', 'Auto Script II', '+3 Credits/sec.', 430, {
        passiveCreditsFlat: 3
    }, ['auto_script_1'], 0, 2), u('thread_splitter', 'Thread Splitter', '+20% automation output.', 850, {
        passiveMultiplier: .20
    }), u('data_daemon', 'Data Daemon', '+0.25 Data/sec.', 1250, {
        passiveDataFlat: .25
    }, [], 8, 3), u('queue_optimizer', 'Queue Optimizer', '+25% automation output.', 2600, {
        passiveMultiplier: .25
    }, [], 20)],
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
    }, [], 36)],
    hardware: [u('ram_stack', 'RAM Stack', '+5 Bandwidth.', 1000, {
        bandwidth: 5
    }, [], 10), u('black_asic', 'Black ASIC Unit', '+15% total rewards.', 2400, {
        globalMultiplier: .15
    }, [], 18), u('signal_booster', 'Signal Booster', '+10 Bandwidth.', 4200, {
        bandwidth: 10
    }, [], 30), u('illegal_coprocessor', 'Illegal Coprocessor', '+20% automation output.', 7000, {
        passiveMultiplier: .20
    }, [], 54)],
    research: [u('target_mapping', 'Target Mapping', 'Advance tiers faster.', 0, {
        progressMultiplier: .15
    }, [], 10), u('chain_access', 'Chain Access', '+10% all rewards.', 0, {
        globalMultiplier: .10
    }, ['target_mapping'], 18), u('node_theory', 'Node Theory', 'Unlock nodes.', 0, {
        nodesUnlocked: true
    }, ['target_mapping'], 25), u('bandwidth_compression', 'Bandwidth Compression', '+5 Bandwidth.', 0, {
        bandwidth: 5
    }, [], 35)],
    nodes: [u('relay_node', 'Relay Node', '+3 Credits/sec. Costs 3 BW.', 500, {
        passiveCreditsFlat: 3
    }, [], 20, 3), u('compute_node', 'Compute Node', '+15% automation output. Costs 5 BW.', 1250, {
        passiveMultiplier: .15
    }, [], 28, 5), u('storage_node', 'Storage Node', '+0.35 Data/sec. Costs 4 BW.', 1600, {
        passiveDataFlat: .35
    }, [], 20, 4), u('ghost_node', 'Ghost Node', '-10% heat gain. Costs 4 BW.', 2400, {
        heatGainMultiplier: -.10
    }, [], 25, 4)],
    prestige: [p('seed_capital', 'Seed Capital', 'Start each run with +25 Credits.', 1, 'seedCapital'), p('signal_familiarity', 'Signal Familiarity', '+5% total rewards permanently.', 2, 'globalBonus', .05), p('cooler_boots', 'Cooler Boots', 'Start each run with lower Heat.', 2, 'coolerBoots'), p('deep_recall', 'Deep Recall', '+10% data gain permanently.', 3, 'dataBonus', .10), p('fast_init', 'Fast Initialization', 'Auto Script I is cheaper.', 3, 'fastInit')]
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
        ['warn', 'Trace Spike', '+15 Heat.', g => {
            g.heat = Math.min(100, g.heat + 15);
        }]
    ],
    export const ACHIEVEMENTS = [a('first_breach', 'First Breach', g => g.stats.totalClicks >= 1), a('hundred_credits', '100 Credits', g => g.lifetimeCredits >= 100), a('auto_online', 'Automation Online', g => !!g.owned.auto_script_1), a('tier_three', 'Tier 3', g => g.targetTier >= 3), a('first_reset', 'Protocol Reset', g => g.stats.totalResets >= 1)],
        export const MILESTONES = [m('scripts_online', 'Scripts Online', g => g.lifetimeCredits >= 25), m('automation_online', 'Automation Online', g => g.lifetimeCredits >= 150), m('tier_2', 'Expand to Tier 2', g => g.targetTier >= 2), m('first_reset', 'Reset Available', g => g.previewFragments >= 1)],
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
                title: 'Step 4 · Prepare for resets',
                done: g => g.previewFragments >= 1
            }];
