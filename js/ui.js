import { TABS, DATA, MODES, TARGETS, BOSSES, TUTORIAL_STEPS, ORIGINS, MUTATIONS } from './content.js';
import { getPassiveCredits, getPassiveData, getPassiveExploits, previewManual, previewHeat, calcFragments, heatPenalty, canBuy, runtimeCredits, runtimeData, contractProgressPercent, challengeProgressPercent } from './systems.js';
import { fmt } from './math.js';

export function $(id) { return document.getElementById(id); }

export function bindElements() {
    const ids = ['creditsValue', 'dataValue', 'exploitsValue', 'heatValue', 'heatFill', 'bwUsed', 'bwMax', 'bwState', 'fragmentsValue', 'resetPreview', 'tierValue', 'tierName', 'scoreValue', 'sessionTime', 'creditsPerSec', 'dataPerSec', 'exploitRate', 'terminalLog', 'heatStatePill', 'tutorialStatus', 'targetName', 'targetReward', 'targetDesc', 'targetRisk', 'targetHeat', 'tierProgress', 'tierProgressText', 'manualInfo', 'passiveCredits', 'passiveData', 'comboValue', 'contractCount', 'activeBuffs', 'bossName', 'bossDesc', 'bossFill', 'contractName', 'contractDesc', 'contractFill', 'contractProgressText', 'challengeName', 'challengeDesc', 'challengeFill', 'challengeProgressText', 'tabs', 'tabContent', 'recentUnlocks', 'toastStack', 'floatLayer', 'offlineModal', 'offlineSummary', 'modeName', 'modeTag', 'modeButtons', 'importModal', 'importField', 'errorModal', 'errorText', 'breachCount', 'contractsWon', 'highestHeatStat', 'scoreMultValue', 'nextFragmentText', 'emergencyBtn', 'originModal', 'originChoices', 'mutationModal', 'mutationChoices'];
    const out = {};
    ids.forEach(id => out[id] = $(id));
    return out;
}

export function render(game, el, activeTab) {
    const mode = MODES[game.runMode], target = TARGETS[game.targetTier];
    game.previewFragments = calcFragments(game);
    el.creditsValue.textContent = fmt(game.credits);
    el.dataValue.textContent = fmt(game.data);
    el.exploitsValue.textContent = fmt(game.exploits);
    el.heatValue.textContent = Math.floor(game.heat);
    const heatStateLabel = heatState(game.heat);
    const heatText = document.getElementById('heatStateText');
    if (heatText) {
        heatText.textContent = heatStateLabel;
        heatText.className = 'sub ' + (game.heat >= 75 ? 'danger-text' : game.heat >= 50 ? 'warn-text' : '');
    }
    el.heatFill.style.width = `${game.heat}%`;
    el.bwUsed.textContent = game.bandwidthUsed;
    el.bwMax.textContent = game.bandwidth;
    el.bwState.textContent = game.bandwidthUsed > game.bandwidth * .8 ? 'Near capacity' : 'Clean';
    el.fragmentsValue.textContent = game.fragments;
    el.resetPreview.textContent = `Reset: ${game.previewFragments}`;
    el.tierValue.textContent = game.targetTier;
    el.tierName.textContent = target.name;
    el.scoreValue.textContent = fmt(game.score);
    el.sessionTime.textContent = `${Math.floor((game.stats.totalPlaytime || 0) / 60)}m`;
    el.creditsPerSec.textContent = `${fmt(getPassiveCredits(game) * heatPenalty(game) * mode.passive)}/sec`;
    el.dataPerSec.textContent = `${fmt(getPassiveData(game) * heatPenalty(game) * mode.data)}/sec`;
    el.exploitRate.textContent = `${fmt(getPassiveExploits(game))}/sec`;
    el.heatStatePill.textContent = heatStateLabel;
    const step = game.tutorialIndex >= TUTORIAL_STEPS.length ? null : TUTORIAL_STEPS[game.tutorialIndex];
    el.tutorialStatus.textContent = step ? step.title : 'Tutorial complete';

    el.targetName.textContent = target.name;
    el.targetReward.textContent = `x${target.reward.toFixed(2)} rewards`;
    el.targetDesc.textContent = target.desc;
    el.targetRisk.textContent = `${target.risk} pressure`;
    el.targetHeat.textContent = target.heatMeta;
    const p = target.threshold === Infinity ? 100 : Math.min(100, (game.progress / target.threshold) * 100);
    el.tierProgress.style.width = `${p}%`;
    el.tierProgressText.textContent = target.threshold === Infinity ? 'Final layer reached. Farm value and reset stronger.' : `${fmt(game.progress)} / ${fmt(target.threshold)} progress into next layer.`;

    el.manualInfo.textContent = `+${previewManual(game)} Credits · ${Math.round(game.manualDataChance * mode.data * 100)}% Data · +${previewHeat(game)} Heat`;
    el.passiveCredits.textContent = fmt(getPassiveCredits(game) * heatPenalty(game) * mode.passive);
    el.passiveData.textContent = fmt(getPassiveData(game) * heatPenalty(game) * mode.data);
    el.comboValue.textContent = fmt(game.combo);
    el.contractCount.textContent = game.stats.contractsDone || 0;
    el.modeName.textContent = mode.name;
    el.modeTag.textContent = mode.tag;

    el.breachCount.textContent = fmt(game.stats.totalClicks || 0);
    el.contractsWon.textContent = fmt(game.stats.contractsDone || 0);
    el.highestHeatStat.textContent = Math.floor(game.stats.highestHeat || 0);
    el.scoreMultValue.textContent = `x${(game.scoreMultiplier || 1).toFixed(2)}`;
    el.nextFragmentText.textContent = `Next fragment preview: ${game.previewFragments}${game.originId ? ` · Origin: ${originName(game.originId)}` : ''}`;

    const buffs = [];
    if (game.originId) buffs.push(`Origin: ${originName(game.originId)}`);
    if (game.mutationsOwned?.length) buffs.push(...game.mutationsOwned.map(x => mutationName(x)));
    if (getPassiveCredits(game) > 0) buffs.push(`Automation ${fmt(getPassiveCredits(game))}/s`);
    if (getPassiveData(game) > 0) buffs.push(`Data ${fmt(getPassiveData(game))}/s`);
    if (getPassiveExploits(game) > 0) buffs.push(`Exploits ${fmt(getPassiveExploits(game))}/s`);
    if (game.manualCritChance > 0) buffs.push(`${Math.round(game.manualCritChance * 100)}% crit`);
    if (game.contractsUnlocked) buffs.push(`Contracts x${(game.contractMultiplier + (game.perks.contractBonus || 0)).toFixed(2)}`);
    if (game.challenge) buffs.push(`Challenge: ${game.challenge.name}`);
    if (game.emergencyReady && !game.emergencyUsed) buffs.push(`Emergency purge ready`);
    if (game.eventBuffs.length) buffs.push(...game.eventBuffs.map(b => `${b.name} ${Math.ceil(b.duration)}s`));
    el.activeBuffs.innerHTML = buffs.length ? buffs.map(x => chip(x)).join('') : chip('No active modifiers');

    const bossEntry = Object.entries(BOSSES).find(([tier]) => game.targetTier >= +tier && !game.bossDefeated[tier]);
    if (!bossEntry) {
        el.bossName.textContent = 'No boss active';
        el.bossDesc.textContent = 'Bosses unlock at major tiers and act as progression checks.';
        el.bossFill.style.width = '0%';
    } else {
        const [, boss] = bossEntry;
        const phase = game.bossState?.id === boss.name ? ` · Phase ${game.bossState.phase}` : '';
        el.bossName.textContent = boss.name + phase;
        el.bossDesc.textContent = boss.desc;
        el.bossFill.style.width = `${game.bossProgress || 0}%`;
    }

    if (game.contract) {
        el.contractName.textContent = game.contract.name;
        el.contractDesc.textContent = game.contract.desc;
        el.contractFill.style.width = `${contractProgressPercent(game)}%`;
        el.contractProgressText.textContent = `${fmt(game.contract.progress)} / ${fmt(game.contract.goal)} · ${Math.ceil(game.contract.timeLeft)}s left`;
    } else {
        el.contractName.textContent = 'No active contract';
        el.contractDesc.textContent = 'Contracts give timed goals with bonus payouts.';
        el.contractFill.style.width = '0%';
        el.contractProgressText.textContent = 'No contract in progress.';
    }

    if (game.challenge) {
        const goal = Math.ceil(game.challenge.goalBase * (1 + Math.max(0, game.targetTier - 3) * .35));
        el.challengeName.textContent = game.challenge.name;
        el.challengeDesc.textContent = game.challenge.desc;
        el.challengeFill.style.width = `${challengeProgressPercent(game)}%`;
        el.challengeProgressText.textContent = `${fmt(game.challenge.progress || 0)} / ${fmt(goal)} · ${Math.ceil(game.challenge.timeLeft)}s left`;
    } else {
        el.challengeName.textContent = 'No active challenge';
        el.challengeDesc.textContent = 'Challenges bend the rules and pay out fragments.';
        el.challengeFill.style.width = '0%';
        el.challengeProgressText.textContent = 'No challenge running.';
    }

    if (el.emergencyBtn) {
        el.emergencyBtn.disabled = !game.emergencyReady || game.emergencyUsed;
        el.emergencyBtn.textContent = game.emergencyUsed ? 'Emergency Spent' : game.emergencyReady ? 'Emergency Purge Ready' : 'Emergency Purge';
    }

    renderModeButtons(game, el);
    renderTabs(el, activeTab);
    renderTabContent(game, el.tabContent, activeTab);
    el.recentUnlocks.innerHTML = (game.recentUnlocks.length ? game.recentUnlocks : ['No recent unlocks yet']).map(x => chip(x)).join('');
    if (el.originChoices) el.originChoices.innerHTML = ORIGINS.map(o => `<button class='origin-btn' data-origin='${o.id}'><strong>${o.name}</strong><span>${o.tag}</span><small>${o.desc}</small></button>`).join('');
    if (el.mutationChoices) el.mutationChoices.innerHTML = (game.mutationDraft || []).map(m => `<button class='origin-btn mutation' data-mutation='${m.id}'><strong>${m.name}</strong><small>${m.desc}</small></button>`).join('');
}

function renderModeButtons(game, el) {
    el.modeButtons.innerHTML = Object.entries(MODES).map(([key, mode]) => `<button class='mode-btn ${game.runMode === key ? 'active' : ''}' data-mode='${key}'>${mode.name}</button>`).join('');
}
export function renderTabs(el, activeTab) {
    el.tabs.innerHTML = TABS.map(tab => `<button class='tab ${tab === activeTab ? 'active' : ''}' data-tab='${tab}'>${tab}</button>`).join('');
}
export function renderTabContent(game, mount, activeTab) {
    const items = DATA[activeTab] || [];
    mount.innerHTML = '';
    for (const item of items) {
        const ownedMap = activeTab === 'research' ? game.researchOwned : activeTab === 'nodes' ? game.nodesOwned : activeTab === 'prestige' ? game.prestigeOwned : game.owned;
        const owned = !!ownedMap[item.id], ready = canBuy(game, activeTab, item), cc = activeTab === 'prestige' ? 0 : runtimeCredits(game, item), dc = activeTab === 'prestige' ? 0 : runtimeData(game, activeTab, item);
        const nodeLocked = activeTab === 'nodes' && !game.nodesUnlocked ? 'Research Node Theory first' : activeTab === 'nodes' && Object.keys(game.nodesOwned).length >= game.nodeSlots && !owned ? `Node slots full (${game.nodeSlots})` : '';
        const div = document.createElement('div');
        div.className = 'system-card';
        div.innerHTML = `<div class='system-top'><div><div class='system-name'>${item.name}</div><div class='system-desc'>${item.desc}</div></div><div class='pill'>${owned ? 'Owned' : 'Ready'}</div></div><div class='meta'><span>${activeTab === 'prestige' ? `${item.costFragments} Fragments` : `${cc ? fmt(cc) + ' Credits' : ''}${cc && dc ? ' · ' : ''}${dc ? fmt(dc) + ' Data' : ''}`}</span><span>${item.bandwidth ? `${item.bandwidth} BW` : activeTab === 'nodes' ? 'Node' : 'No BW cost'}</span></div>${item.requires ? `<div class='small'>Requires: ${item.requires.join(', ')}</div>` : ''}${nodeLocked ? `<div class='small danger-text'>${nodeLocked}</div>` : ''}<button class='buy-btn ${ready ? 'ready' : ''}' data-buy='${activeTab}:${item.id}' ${owned || !ready ? 'disabled' : ''}>${owned ? 'Installed' : ready ? 'Buy' : nodeLocked || 'Unavailable'}</button>`;
        mount.appendChild(div);
    }
}
export function addLog(el, text) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML = `<span class='log-time'>[${clock()}]</span>${text}`;
    el.terminalLog.prepend(line);
    while (el.terminalLog.children.length > 160) el.terminalLog.removeChild(el.terminalLog.lastChild);
}
export function toast(el, title, body) {
    const d = document.createElement('div');
    d.className = 'toast';
    d.innerHTML = `<div class='toast-title'>${title}</div><div>${body}</div>`;
    el.toastStack.prepend(d);
    while (el.toastStack.children.length > 6) el.toastStack.removeChild(el.toastStack.lastChild);
    setTimeout(() => d.remove(), 2600);
}
export function floatText(el, text, x, y, color = 'var(--cyan)') {
    if (el.floatLayer.children.length > 24) return;
    const d = document.createElement('div');
    d.className = 'float';
    d.textContent = text;
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    d.style.color = color;
    el.floatLayer.appendChild(d);
    setTimeout(() => d.remove(), 900);
}
export function showOffline(el, summary) { el.offlineSummary.textContent = summary; el.offlineModal.classList.add('show'); }
export function hideOffline(el) { el.offlineModal.classList.remove('show'); }
export function showImport(el) { el.importModal.classList.add('show'); }
export function hideImport(el) { el.importModal.classList.remove('show'); }
export function showError(el, text) { el.errorText.textContent = text; el.errorModal.classList.add('show'); }
export function showOriginModal(el) { el.originModal.classList.add('show'); }
export function hideOriginModal(el) { el.originModal.classList.remove('show'); }
export function showMutationModal(el) { el.mutationModal.classList.add('show'); }
export function hideMutationModal(el) { el.mutationModal.classList.remove('show'); }

function chip(text) { return `<div class='chip'>${text}</div>`; }
function clock() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}
function heatState(v) {
    if (v >= 100) return 'Lockdown';
    if (v >= 75) return 'Critical';
    if (v >= 50) return 'Traced';
    if (v >= 25) return 'Watched';
    return 'Stable';
}
function originName(id) { return ORIGINS.find(x => x.id === id)?.name || id; }
function mutationName(id) { return MUTATIONS.find(x => x.id === id)?.name || id; }
export function closeAllModals(el) {
    el.offlineModal.classList.remove('show');
    el.importModal.classList.remove('show');
    el.originModal.classList.remove('show');
    el.mutationModal.classList.remove('show');
}
