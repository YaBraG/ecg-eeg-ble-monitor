export function appendSample(samples: number[], nextSample: number, maxLength: number) {
  const updated = [...samples, nextSample];

  if (updated.length <= maxLength) {
    return updated;
  }

  return updated.slice(updated.length - maxLength);
}

export function createEmptySamples(length: number) {
  return Array.from({ length }, () => 0);
}
