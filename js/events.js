import { EVENTS } from './content.js';
import { addBuff } from './systems.js';

export function triggerEvent(g, context = {}) {
    g.stats.eventsSeen++;
    g._addBuff = (name, duration, delta) => addBuff(g, name, duration, delta);
    const heat = context.heat ?? g.heat;
    const badChance = Math.min(.82, .18 + heat / 150 - g.badEventReduction + (g.challenge ? .06 : 0));
    const isBad = Math.random() < badChance;
    if (isBad && Math.random() < g.badEventCancelChance) return {
        canceled: true,
        tone: 'good',
        title: 'Decoy Traffic',
        text: 'A hostile event was cancelled.'
    };
    let pool = EVENTS;
    if (isBad) pool = EVENTS.filter(x => x[0] !== 'good' || Math.random() < .35);
    else if (context.mode === 'ghost') pool = EVENTS.filter(x => x[0] !== 'bad' || Math.random() < .2);
    const ev = pool[Math.floor(Math.random() * pool.length)];
    ev[3](g);
    return { tone: ev[0], title: ev[1], text: ev[2] };
}
