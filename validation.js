export function validateCollections(cols) {
    const seen = new Set();
    for (const [name, items] of Object.entries(cols)) {
        for (const item of items) {
            if (seen.has(item.id)) throw new Error('Duplicate content id: ' + item.id);
            seen.add(item.id);
            for (const req of item.requires || []) {
                if (!Object.values(cols).flat().some(x => x.id === req)) throw new Error('Missing requirement ' + req + ' in ' + name);
            }
        }
    }
}
