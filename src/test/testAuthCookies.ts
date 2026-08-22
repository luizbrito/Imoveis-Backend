// set-cookie may contain several comma-joined cookies with attributes;
// reduce to a "name=value; name2=value2" cookie request header.
export function cookiesFromSetCookie(setCookie: string | null): string {
  if (!setCookie) return '';
  return setCookie
    .split(/,(?=\s*[^;=,\s]+=)/)
    .map((c) => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');
}
