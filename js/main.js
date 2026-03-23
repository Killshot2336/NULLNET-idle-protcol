import { bindElements, render, addLog, toast, floatText, showOffline, hideOffline, showImport, hideImport, showError, showOriginModal, hideOriginModal, showMutationModal, hideMutationModal } from './ui.js';
import { MODES, TUTORIAL_STEPS, ACHIEVEMENTS, MILESTONES } from './content.js';
import { createState, sanitizeState } from './state.js';
import { loadGame, saveGame, importSave, wipeGame } from './save.js';
import { manualBreach, coolTrace, burst, useExploit, getPassiveCredits, getPassiveData, getPassiveExploits, heatPenalty, calcFragments, updateTier, attemptBoss, buy, applyPersistentPerks, startRunBonuses, removeBuff, maybeSpawnContract, tickContract, rerollContract, maybeAssignChallenge, tickChallenge, emergencyPurge, applyOrigin, getMutationChoices, chooseMutation, applyMetaLoadout } from './systems.js';
import { triggerEvent } from './events.js';
import { Logger } from './logger.js';
import { clamp } from './math.js';

let activeTab = 'scripts';
const el = bindElements();

window.addEventListener('error', e => Logger.error(e.error || e.message));
window.addEventListener('unhandledrejection', e => Logger.error(e.reason));


const scene = document.getElementById('scene');
if (scene) {
    const ctx = scene.getContext('2d');
    const dots = Array.from({ length: 56 }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22 }));
    const size = () => { scene.width = innerWidth; scene.height = innerHeight; };
    size();
    addEventListener('resize', size);
    (function drawScene() {
        ctx.clearRect(0, 0, scene.width, scene.height);
        ctx.strokeStyle = 'rgba(88,227,255,.08)';
        for (let i = 0; i < dots.length; i++) {
            const a = dots[i];
            a.x += a.vx; a.y += a.vy;
            if (a.x < 0 || a.x > scene.width) a.vx *= -1;
            if (a.y < 0 || a.y > scene.height) a.vy *= -1;
            ctx.fillStyle = 'rgba(88,227,255,.45)';
            ctx.fillRect(a.x, a.y, 2, 2);
            for (let j = i + 1; j < dots.length; j++) {
                const b = dots[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 130) {
                    ctx.globalAlpha = 1 - dist / 130;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }
        requestAnimationFrame(drawScene);
    })();
}

try {
    const loaded = loadGame();
    let game = loaded.game || createState();
    rehydrate(game);
    let offlineCache = loaded.offline;
    if (loaded.recovered) toast(el, 'Recovery', 'Recovered backup save.');
    if (loaded.corrupted) toast(el, 'Save Reset', 'Corrupted save could not be read.');
    if (loaded.storage === false) toast(el, 'Storage', 'localStorage unavailable.');
    boot();
    renderAll();

    function rehydrate(target) {
        sanitizeState(target);
        applyPersistentPerks(target);
        applyMetaLoadout(target);
        startRunBonuses(target);
    }

    function boot() {
        addLog(el, 'NULLNET kernel booted.');
        addLog(el, 'Signal mask stabilizing.');
        addLog(el, 'Proxy lattice aligned.');
        addLog(el, 'Manual breach channel live.');

        if (!game.originSelected) showOriginModal(el);

        bind('breachBtn', 'click', e => {
            if (game.heat >= 100) {
                addLog(el, 'Lockdown active. Breach route jammed.');
                toast(el, 'Lockdown', 'Heat is capped. Vent trace first.');
                return;
            }
            const result = manualBreach(game);
            addLog(el, `${result.mega ? 'Overrun landed' : result.crit ? 'Critical breach complete' : 'Breach complete'}. +${result.reward} Credits${result.data ? ` · +${result.data} Data` : ''}`);
            floatText(el, `+${result.reward}c${result.data ? ` +${result.data}d` : ''}`, e.clientX || window.innerWidth * .52, e.clientY || window.innerHeight * .45, result.mega ? 'var(--green)' : 'var(--cyan)');
            updateTutorial();
            renderAll();
        });
        bind('coolBtn', 'click', () => {
            if (game.cooldowns.coolTrace > 0) return;
            const removed = coolTrace(game);
            addLog(el, `Trace vented. -${removed} Heat.`);
            toast(el, 'Cooling', `Trace vented for ${removed} Heat.`);
            renderAll();
        });
        bind('burstBtn', 'click', () => {
            if (game.cooldowns.burst > 0 || game.burstCharge < 100) return;
            burst(game);
            addLog(el, 'Overclock Burst armed. Massive gains for 10s.');
            toast(el, 'Burst', 'Output surge active for 10 seconds.');
            renderAll();
        });
        bind('exploitBtn', 'click', () => {
            if (game.cooldowns.exploit > 0 || game.exploits < 1) return;
            const name = useExploit(game);
            if (!name) return;
            addLog(el, `${name} deployed.`);
            toast(el, 'Exploit', `${name} activated.`);
            renderAll();
        });
        bind('emergencyBtn', 'click', () => {
            const removed = emergencyPurge(game);
            if (!removed) return;
            addLog(el, `Emergency purge executed. -${removed} Heat. Combo stabilized.`);
            toast(el, 'CLUTCH SAVE', 'Trace purged. You survived.');
            renderAll();
        });
        bind('bossBtn', 'click', () => {
            const result = attemptBoss(game);
            if (result.state === 'none') {
                addLog(el, 'No boss breach available right now.');
                return;
            }
            if (result.state === 'win') {
                addLog(el, `${result.name} broken. +${result.fragments} Fragments · +${result.exploits} Exploits.`);
                pushUnlock(result.name);
                toast(el, 'Boss Cleared', result.name);
            } else if (result.state === 'phase') {
                addLog(el, `${result.name} phase ${result.phase} destabilized.`);
                toast(el, 'Boss Phase', `${result.name} · Phase ${result.phase}`);
            } else {
                addLog(el, `${result.name} repelled the breach. Build stronger and try again.`);
                toast(el, 'Boss Failed', 'You need more power and control.');
            }
            renderAll();
        });
        bind('rerollContractBtn', 'click', () => {
            rerollContract(game);
            toast(el, 'Contract', 'Contract rerolled.');
            renderAll();
        });
        bind('resetBtn', 'click', () => {
            const fragments = calcFragments(game);
            if (fragments < 1) {
                addLog(el, 'Protocol Reset denied. More run value required.');
                return;
            }
            const keep = {
                fragments: game.fragments + fragments,
                exploits: game.exploits,
                prestigeOwned: game.prestigeOwned,
                achievements: game.achievements,
                milestones: game.milestones,
                stats: { ...game.stats, totalResets: game.stats.totalResets + 1 },
                perks: game.perks,
                bossDefeated: game.bossDefeated,
                tutorialIndex: game.tutorialIndex,
                runMode: game.runMode,
                recentUnlocks: game.recentUnlocks,
                originId: game.originId,
                originSelected: game.originSelected,
                mutationsOwned: game.mutationsOwned
            };
            game = createState(keep);
            rehydrate(game);
            game.mutationDraft = getMutationChoices(game);
            if (game.mutationDraft.length) showMutationModal(el);
            addLog(el, `Protocol Reset executed. +${fragments} Fragments secured.`);
            toast(el, 'Protocol Reset', `Secured ${fragments} Fragments.`);
            renderAll();
        });
        bind('saveBtn', 'click', () => {
            if (saveGame(game)) {
                toast(el, 'Save', 'Run saved locally.');
                saveGame(game, true);
            } else toast(el, 'Save Failed', 'Storage unavailable.');
        });
        bind('backupBtn', 'click', () => {
            if (saveGame(game, true)) toast(el, 'Backup', 'Backup slot saved.');
            else toast(el, 'Backup Failed', 'Storage unavailable.');
        });
        bind('exportBtn', 'click', async () => {
            try {
                await navigator.clipboard.writeText(JSON.stringify(game));
                toast(el, 'Export', 'Save copied to clipboard.');
            } catch {
                toast(el, 'Export', 'Copy failed.');
            }
        });
        bind('importBtn', 'click', () => showImport(el));
        bind('importCancelBtn', 'click', () => hideImport(el));
        bind('importConfirmBtn', 'click', () => {
            try {
                game = importSave(el.importField.value);
                rehydrate(game);
                hideImport(el);
                toast(el, 'Import', 'Save imported.');
                renderAll();
            } catch {
                toast(el, 'Import Failed', 'Invalid save JSON.');
            }
        });
        bind('wipeBtn', 'click', () => {
            wipeGame();
            game = createState();
            showOriginModal(el);
            renderAll();
            toast(el, 'Wipe', 'Fresh route established.');
        });
        bind('offlineClaimBtn', 'click', () => { hideOffline(el); offlineCache = null; });
        bind('offlineConvertBtn', 'click', () => {
            if (offlineCache?.credits) {
                const convert = offlineCache.credits * .3;
                const extra = Math.max(1, Math.round(convert / 65));
                game.credits = Math.max(0, game.credits - convert);
                game.data += extra;
                game.lifetimeData += extra;
                toast(el, 'Offline Conversion', `${extra} extra Data recovered.`);
            }
            hideOffline(el); offlineCache = null; renderAll();
        });
        bind('offlineSkipBtn', 'click', () => { hideOffline(el); offlineCache = null; });

        el.tabs.addEventListener('click', e => {
            const tabBtn = e.target.closest('[data-tab]');
            if (!tabBtn) return;
            activeTab = tabBtn.dataset.tab;
            renderAll();
        });
        document.getElementById('modeButtons').addEventListener('click', e => {
            const btn = e.target.closest('[data-mode]');
            if (!btn) return;
            game.runMode = btn.dataset.mode;
            renderAll();
            toast(el, 'Mode', `${MODES[game.runMode].name} engaged.`);
        });
        el.tabContent.addEventListener('click', e => {
            const btn = e.target.closest('[data-buy]');
            if (!btn) return;
            const [tab, id] = btn.dataset.buy.split(':');
            const item = buy(game, tab, id);
            if (!item) return;
            addLog(el, `${item.name} installed.`);
            toast(el, 'Installed', item.name);
            updateTutorial();
            renderAll();
        });
        el.originChoices?.addEventListener('click', e => {
            const btn = e.target.closest('[data-origin]');
            if (!btn) return;
            const origin = applyOrigin(game, btn.dataset.origin);
            if (!origin) return;
            hideOriginModal(el);
            addLog(el, `${origin.name} origin linked.`);
            toast(el, 'Origin Selected', origin.name);
            renderAll();
        });
        el.mutationChoices?.addEventListener('click', e => {
            const btn = e.target.closest('[data-mutation]');
            if (!btn) return;
            const item = chooseMutation(game, btn.dataset.mutation);
            if (!item) return;
            hideMutationModal(el);
            addLog(el, `Mutation grafted: ${item.name}.`);
            toast(el, 'Mutation', item.name);
            renderAll();
        });

        if (offlineCache) {
            const seconds = offlineCache.secondsAway, mode = MODES[game.runMode], credits = getPassiveCredits(game) * heatPenalty(game) * mode.passive * seconds * .40, data = getPassiveData(game) * heatPenalty(game) * mode.data * seconds * .40;
            game.credits += credits; game.data += data; game.lifetimeCredits += credits; game.lifetimeData += data;
            offlineCache.credits = credits; offlineCache.data = data;
            showOffline(el, `You were away for ${formatDuration(seconds)} and earned ${Math.round(credits)} Credits and ${Math.round(data)} Data.`);
        }
        window.addEventListener('pagehide', () => saveGame(game));
        document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(game); });
        setInterval(() => saveGame(game), 10000);
        requestAnimationFrame(loop);
    }

    function loop() {
        const now = Date.now();
        let dt = Math.min(.25, (now - game.lastTick) / 1000);
        game.lastTick = now;
        if (!Number.isFinite(dt) || dt < 0) dt = 0;
        game.stats.totalPlaytime += dt;
        if (game.heat < 25) game.stats.lowHeatTime += dt;

        for (const k in game.cooldowns) if (game.cooldowns[k] > 0) game.cooldowns[k] = Math.max(0, game.cooldowns[k] - dt);
        if (game.stealthWindow > 0) game.stealthWindow = Math.max(0, game.stealthWindow - dt);
        if (game.comboTimer > 0) game.comboTimer = Math.max(0, game.comboTimer - dt);
        else if (game.combo > 0) {
            const decay = 2.5 + game.combo * 0.11 + (game.comboDecayPenalty || 0);
            game.combo = Math.max(0, game.combo - dt * decay);
        }
        if (game.cooldowns.burst <= 0 && game.burstCharge < 100) game.burstCharge = Math.min(100, game.burstCharge + dt * 2.2);
        game.eventBuffs = game.eventBuffs.filter(b => {
            b.duration -= dt;
            if (b.duration <= 0) {
                removeBuff(game, b);
                addLog(el, `${b.name} expired.`);
                return false;
            }
            return true;
        });

        if (game.heat >= 92 && !game.emergencyUsed) game.emergencyReady = true;
        if (game.heat < 70) game.warningState = false;
        if (game.heat > 90 && !game.warningState) {
            game.warningState = true;
            addLog(el, 'WARNING: TRACE CRITICAL');
            toast(el, 'WARNING', 'Heat nearing lockdown');
        }

        const mode = MODES[game.runMode];
        const c = getPassiveCredits(game) * heatPenalty(game) * mode.passive;
        const d = getPassiveData(game) * heatPenalty(game) * mode.data;
        const x = getPassiveExploits(game);
        if (c > 0) {
            game.credits += c * dt;
            game.lifetimeCredits += c * dt;
            game.progress += c * dt * .2 * game.progressMultiplier;
            game.score += c * dt * (game.scoreMultiplier || 1);
            if (game.contract) game.contract.progress += game.contract.type === 'credits' ? c * dt * .3 : 0;
        }
        if (d > 0) {
            game.data += d * dt;
            game.lifetimeData += d * dt;
            game.score += d * dt * 12;
        }
        if (x > 0) game.exploits += x * dt;
        game.heat = clamp(Math.max(game.minHeatFloor || 0, game.heat - (.58 * game.heatDecayMultiplier * dt)), 0, 100);
        if (game.heat > game.stats.highestHeat) game.stats.highestHeat = game.heat;

        if (!game.contract) maybeSpawnContract(game);
        const contractResult = tickContract(game, dt);
        if (contractResult) {
            if (contractResult.type === 'win') {
                addLog(el, `${contractResult.name} completed. +${contractResult.credits} Credits · +${contractResult.data} Data.`);
                toast(el, 'Contract Complete', contractResult.name);
                pushUnlock(contractResult.name);
            } else {
                addLog(el, `${contractResult.name} failed.`);
                toast(el, 'Contract Failed', contractResult.name);
            }
        }

        maybeAssignChallenge(game);
        const challengeResult = tickChallenge(game, dt);
        if (challengeResult) {
            if (challengeResult.type === 'win') {
                addLog(el, `${challengeResult.name} cleared. +${challengeResult.credits} Credits${challengeResult.fragments ? ` · +${challengeResult.fragments} Fragments` : ''}.`);
                toast(el, 'Challenge Complete', challengeResult.name);
                pushUnlock(challengeResult.name);
            } else {
                addLog(el, `${challengeResult.name} collapsed.`);
                toast(el, 'Challenge Failed', challengeResult.name);
            }
        }

        game.eventTimer -= dt;
        if (game.eventTimer <= 0) {
            const ev = triggerEvent(game, { heat: game.heat, combo: game.combo, mode: game.runMode });
            addLog(el, `${ev.title} — ${ev.text}`);
            toast(el, ev.title, ev.text);
            game.eventTimer = 24 + Math.random() * 18 - Math.min(10, game.heat / 11);
        }

        const tierName = updateTier(game);
        if (tierName) {
            pushUnlock(`Target tier expanded: ${tierName}`);
            addLog(el, `Target tier expanded: ${tierName}.`);
            toast(el, 'Unlock', tierName);
        }
        updateTutorial();
        checkAchievements();
        checkMilestones();
        sanitizeState(game);
        renderAll();
        requestAnimationFrame(loop);
    }

    function bind(id, event, fn) {
        const node = document.getElementById(id);
        if (!node) throw new Error(`Missing DOM node: ${id}`);
        node.addEventListener(event, fn);
    }
    function updateTutorial() {
        while (game.tutorialIndex < TUTORIAL_STEPS.length && TUTORIAL_STEPS[game.tutorialIndex].done(game)) game.tutorialIndex++;
    }
    function pushUnlock(text) {
        game.recentUnlocks.unshift(text);
        game.recentUnlocks = game.recentUnlocks.slice(0, 8);
    }
    function checkAchievements() {
        for (const x of ACHIEVEMENTS) if (!game.achievements[x.id] && x.check(game)) {
            game.achievements[x.id] = true;
            pushUnlock(x.name);
            addLog(el, `Achievement unlocked: ${x.name}.`);
            toast(el, 'Achievement', x.name);
        }
    }
    function checkMilestones() {
        for (const x of MILESTONES) if (!game.milestones[x.id] && x.check(game)) {
            game.milestones[x.id] = true;
            pushUnlock(x.name);
            addLog(el, `Milestone reached: ${x.name}.`);
            toast(el, 'Milestone', x.name);
        }
    }
    function renderAll() { render(game, el, activeTab); }
    function formatDuration(s) {
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
} catch (err) {
    Logger.error(err);
    try { showError(el, String(err?.message || err)); } catch {}
}
