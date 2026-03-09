export function validateCollections(cols) {
    const seen = new Set();
    const all = [];
    for (const items of Object.values(cols))
        for (const item of items) all.push(item.id);
    for (const [name, items] of Object.entries(cols)) {
        for (const item of items) {
            if (seen.has(item.id)) throw new Error('Duplicate content id: ' + item.id);
            seen.add(item.id);
            for (const req of item.requires || []) {
                if (!all.includes(req)) throw new Error('Missing requirement ' + req + ' in ' + name);
            }
        }
    }
}
