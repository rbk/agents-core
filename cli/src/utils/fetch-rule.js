const BASE = 'https://agents-cli-v1.pages.dev';

export async function fetchRule(urlPath) {
  const url = `${BASE}/${urlPath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Not found: ${url}`);
  return res.text();
}
