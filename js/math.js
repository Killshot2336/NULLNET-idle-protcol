export function clamp(n, min, max) {
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
}
export function safe(n, f = 0) {
    return Number.isFinite(n) ? n : f;
}
export function fmt(n) {
    if (!Number.isFinite(n)) return '0';
    if (n >= 1e15) return n.toExponential(2);
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return (Math.round(n * 10) / 10).toString();
}
