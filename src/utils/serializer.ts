export function serialize(value: unknown, redactKeys: string[] = []): unknown {
    if (value === null || value === undefined) return value;

    if (typeof value !== 'object') return value;

    // Basic circular dependency check (simplified)
    const cache = new Set();

    const process = (item: unknown): unknown => {
        if (item === null || typeof item !== 'object') return item;
        if (cache.has(item)) return '[Circular]';
        cache.add(item);

        if (Array.isArray(item)) {
            return item.map(process);
        }

        const result: Record<string, unknown> = {};
        const obj = item as Record<string, unknown>;
        for (const key in obj) {
            if (redactKeys.includes(key)) {
                result[key] = '[REDACTED]';
            } else {
                result[key] = process(obj[key]);
            }
        }
        return result;
    };

    return process(value);
}
