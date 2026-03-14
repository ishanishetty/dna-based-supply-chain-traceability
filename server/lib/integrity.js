import crypto from 'crypto';

/**
 * Standardizes a timestamp to 'YYYY-MM-DD HH:mm:ss' which is MySQL compatible
 * and consistent for our hashing algorithm.
 * @param {Date|string} ts 
 * @returns {string}
 */
export function formatTimestamp(ts) {
    const d = ts instanceof Date ? ts : new Date(ts);
    // Using ISO string and slicing avoids local timezone issues if servers shift
    // However, we must ensure we don't lose precision if DB stores it.
    // MySQL TIMESTAMP usually keeps seconds.
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Computes SHA-256 hash for a mutation record.
 * @param {string} previousDna 
 * @param {string} mutatedDna 
 * @param {string} mutationReason 
 * @param {string|Date} mutationTimestamp
 * @returns {string} SHA-256 hash in hex format
 */
export function computeMutationHash(previousDna, mutatedDna, mutationReason, mutationTimestamp) {
    const tsStr = formatTimestamp(mutationTimestamp);
    const data = (previousDna || '') + mutatedDna + mutationReason + tsStr;
    return crypto.createHash('sha256').update(data).digest('hex');
}
