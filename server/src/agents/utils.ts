/**
 * Sanitize a name to be a valid ADK agent identifier.
 * Must start with a letter or underscore, contain only [a-zA-Z0-9_].
 */
export function sanitizeAgentName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^(\d)/, '_$1');
}
