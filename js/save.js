import {
    createState,
    sanitizeState,
    rebuildPermanentState
} from './state.js';
import {
    VERSION
} from './content.js';
export const STORAGE_KEY = 'nullnet_major_update_primary';
export const BACKUP_KEY = 'nullnet_major_update_backup';

function hasStorage() {
    try {
        localStorage.setItem('__t', '1');
        localStorage.removeItem('__t');
        return true;
    } catch {
        return false;
    }
}

function serialize(game) {
    return JSON.stringify({
        ...game,
        version: VERSION
    });
}
export function saveGame(game, backup = false) {
    if (!hasStorage()) return false;
    try {
        localStorage.setItem(backup ? BACKUP_KEY : STORAGE_KEY, serialize(game));
        return true;
    } catch {
        return false;
    }
}
export function loadGame() {
    if (!hasStorage()) return {
        game: createState(),
        offline: null,
        storage: false
    };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {
        game: createState(),
        offline: null,
        storage: true
    };
    try {
        const parsed = JSON.parse(raw);
        const game = rebuildPermanentState(Object.assign(createState(parsed), parsed));
        sanitizeState(game);
        const secondsAway = Math.min(4 * 3600, Math.max(0, (Date.now() - (parsed.lastTick || Date.now())) / 1000));
        game.lastTick = Date.now();
        return {
            game,
            offline: secondsAway > 5 ? {
                secondsAway
            } : null,
            storage: true
        };
    } catch {
        const backup = localStorage.getItem(BACKUP_KEY);
        if (backup) {
            try {
                const parsed = JSON.parse(backup);
                const game = rebuildPermanentState(Object.assign(createState(parsed), parsed));
                sanitizeState(game);
                game.lastTick = Date.now();
                return {
                    game,
                    offline: null,
                    storage: true,
                    recovered: true
                };
            } catch {}
        }
        return {
            game: createState(),
            offline: null,
            storage: true,
            corrupted: true
        };
    }
}
export function importSave(text) {
    const parsed = JSON.parse(text);
    const game = rebuildPermanentState(Object.assign(createState(parsed), parsed));
    sanitizeState(game);
    return game;
}
export function wipeGame() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(BACKUP_KEY);
    } catch {}
}
