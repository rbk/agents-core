export async function onRequest({ params }) {
  const path = params.path ? params.path.join('/') : '';
  const url = `https://raw.githubusercontent.com/rbk/agents-core/main/agents/${path}`;
  const res = await fetch(url);
  if (!res.ok) return new Response('Not found', { status: 404 });
  const text = await res.text();
  return new Response(text, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
