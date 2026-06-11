export function toFileUri(pathOrUri: string) {
  if (pathOrUri.startsWith('file://')) {
    return pathOrUri;
  }

  return `file://${pathOrUri}`;
}

export function joinFileUri(basePath: string, relativePath: string) {
  const normalizedBase = basePath.replace(/^file:\/\//, '').replace(/[\\/]+$/, '');
  const normalizedRelative = relativePath.replace(/^[\\/]+/, '').replace(/\\/g, '/');

  return toFileUri(`${normalizedBase}/${normalizedRelative}`);
}
