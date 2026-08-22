/**
 * Parses nested query parameters into a real object
 * Supports formats like:
 * - user[name]=John -> { user: { name: "John" } }
 * - items[0]=apple -> { items: ["apple"] }
 * - user[address][city]=NYC -> { user: { address: { city: "NYC" } } }
 */
export function parseHonoQuery(
  query: Record<string, string>,
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    setNestedValue(result, key, value);
  }

  return result;
}

/**
 * Sets a nested value in an object based on a key path
 * @param obj - The target object
 * @param path - The key path (e.g., "user[name]" or "items[0]")
 * @param value - The value to set
 */
function setNestedValue(
  obj: Record<string, any>,
  path: string,
  value: string,
): void {
  const segments = parsePath(path);

  let current = obj;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const isLast = i === segments.length - 1;

    if (isLast) {
      current[segment.key] = value;
    } else {
      const nextSegment = segments[i + 1];

      if (!current[segment.key]) {
        current[segment.key] = nextSegment.isArrayIndex ? [] : {};
      }

      current = current[segment.key];
    }
  }
}

/**
 * Parses a path string into segments
 * Examples:
 * - "user[name]" -> [{ key: "user" }, { key: "name" }]
 * - "items[0]" -> [{ key: "items" }, { key: "0", isArrayIndex: true }]
 * - "user[address][city]" -> [{ key: "user" }, { key: "address" }, { key: "city" }]
 */
function parsePath(
  path: string,
): Array<{ key: string; isArrayIndex: boolean }> {
  const segments: Array<{ key: string; isArrayIndex: boolean }> = [];

  const firstKeyMatch = path.match(/^([^\[]+)/);
  if (firstKeyMatch) {
    segments.push({ key: firstKeyMatch[1], isArrayIndex: false });
  }

  const bracketMatches = path.matchAll(/\[([^\]]+)\]/g);
  for (const match of bracketMatches) {
    const key = match[1];
    const isArrayIndex = /^\d+$/.test(key);
    segments.push({ key, isArrayIndex });
  }

  return segments;
}
