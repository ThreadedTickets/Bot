const levenshteinDistance = (a: string, b: string): number => {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]).map((row, i) =>
    row.concat(Array.from({ length: a.length }, (_, j) => (i === 0 ? j + 1 : 0)))
  );

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1].toLowerCase() === b[i - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return matrix[b.length][a.length];
};

export const similarity = (a: string, b: string): number => {
  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
};
