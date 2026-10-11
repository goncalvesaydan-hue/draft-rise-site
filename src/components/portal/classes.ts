export function portalClass(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => `p-${name}`)
    .join(" ");
}
