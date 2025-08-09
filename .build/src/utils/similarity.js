"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="45e0d5d8-b3e8-588a-bbc9-3f33391d7bc0")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.similarity = void 0;
const levenshteinDistance = (a, b) => {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]).map((row, i) => row.concat(Array.from({ length: a.length }, (_, j) => (i === 0 ? j + 1 : 0))));
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = a[j - 1].toLowerCase() === b[i - 1].toLowerCase() ? 0 : 1;
            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, // Deletion
            matrix[i][j - 1] + 1, // Insertion
            matrix[i - 1][j - 1] + cost // Substitution
            );
        }
    }
    return matrix[b.length][a.length];
};
const similarity = (a, b) => {
    const distance = levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
};
exports.similarity = similarity;
//# sourceMappingURL=/src/utils/similarity.js.map
//# debugId=45e0d5d8-b3e8-588a-bbc9-3f33391d7bc0
